import { AxiosError } from 'axios';
import { arrayRemove } from '../../utils/array';
import { getCurrentServerTime } from '../../utils/server-time';
import { Api } from '../api/api.service';
import { EmojiSelectorModal } from '../emoji/selector-modal/modal.service';
import { showErrorGrowl } from '../growls/growls.service';
import { PayloadError } from '../payload/payload-service';
import { $gettext } from '../translate/translate.service';

interface EmojiData {
	emoji_id: number;
	emoji_short_name: string;
	emoji_prefix: string;
	emoji_img_url: string;
}

interface UserDeltas {
	delta_inc: number[];
	delta_dec: number[];
}

export interface EmojiDelta extends EmojiData, UserDeltas {}

export interface UpdateReactionCountPayload extends EmojiData, UserDeltas {
	current_user_id: number;
	model: ReactionableModel;
}

interface ApplyReactionPayload extends EmojiData {
	existing_reaction: ReactionCount | undefined;
	model: ReactionableModel;
	count_mod: number;
	did_react: boolean;
}

export interface ReactionableModel {
	id: number;
	reaction_counts: ReactionCount[];

	get resourceName(): string;
}

interface EmojiIdAndCount {
	emoji_id: number;
	count: number;
}
const ModelsPendingReactions = new WeakMap<ReactionableModel, EmojiIdAndCount[]>();

function applyReaction({
	existing_reaction,
	count_mod,
	did_react,
	model,
	emoji_id,
	emoji_img_url,
	emoji_prefix,
	emoji_short_name,
}: ApplyReactionPayload) {
	if (existing_reaction) {
		if (existing_reaction.count + count_mod <= 0) {
			arrayRemove(model.reaction_counts, i => i.id === emoji_id);
		} else {
			existing_reaction.count = existing_reaction.count + count_mod;
			existing_reaction.did_react = did_react;
		}
	} else if (count_mod > 0) {
		model.reaction_counts.push(
			new ReactionCount({
				id: emoji_id,
				img_url: emoji_img_url,
				prefix: emoji_prefix,
				short_name: emoji_short_name,
				count: count_mod,
				did_react: did_react,
			})
		);
	}
}

export async function updateReactionCount({
	emoji_id,
	emoji_img_url,
	emoji_prefix,
	emoji_short_name,
	delta_inc,
	delta_dec,
	current_user_id,
	model,
}: UpdateReactionCountPayload) {
	let countMod = delta_inc.length - delta_dec.length;

	const existingReaction = model.reaction_counts.find(i => i.id === emoji_id);
	const userReactingCount = delta_inc.filter(id => id === current_user_id).length;
	const userUnreactingCount = delta_dec.filter(id => id === current_user_id).length;

	let didReact = userReactingCount > 0;
	let updateDidReactIndicator = false;

	if (existingReaction) {
		// emoji.did_react will need to be updated if userReactingCount and userUnreactingCount are not equal
		if (userReactingCount !== userUnreactingCount) {
			didReact = !existingReaction.did_react;
			updateDidReactIndicator = true;
		} else {
			didReact = existingReaction.did_react;
		}
	}

	// we need to cancel out the self reactions made earlier in toggleReactionOnResource()
	// as we the payload we receive from the grid will include our own reactions
	const pendingReactions = ModelsPendingReactions.get(model);
	if (pendingReactions && pendingReactions.length) {
		const pendingEmojiReaction = pendingReactions.find(i => i.emoji_id === emoji_id);
		if (pendingEmojiReaction) {
			countMod = countMod - pendingEmojiReaction.count;
			arrayRemove(pendingReactions, i => i.emoji_id === emoji_id);

			// having pendingEmojiReaction means we have reacted to this emoji in this client/tab,
			// thus did_react indicator would have been updated locally
			updateDidReactIndicator = false;
		}
	}

	// even if the nett count is 0, we still need to update the did_react state if the user's
	// did_react state has been changed (user's reaction from diff tab)
	if (countMod === 0 && !updateDidReactIndicator) {
		return;
	}

	applyReaction({
		existing_reaction: existingReaction,
		count_mod: countMod,
		did_react: didReact,
		model: model,
		emoji_id: emoji_id,
		emoji_img_url: emoji_img_url,
		emoji_prefix: emoji_prefix,
		emoji_short_name: emoji_short_name,
	});
}

export class ReactionCount {
	/**
	 * This is the emojiId that was reacted with, not a unique id for this
	 * reaction count on a resource.
	 */
	declare id: number;
	declare img_url: string;
	declare prefix: string;
	declare short_name: string;
	declare count: number;
	declare did_react: boolean;

	constructor(data: any) {
		Object.assign(this, data);
	}

	static populate(rows: any[]): any[] {
		const models: any[] = [];
		if (rows && Array.isArray(rows) && rows.length) {
			for (const row of rows) {
				models.push(new ReactionCount(row));
			}
		}
		return models;
	}

	get commandName() {
		return `:${this.prefix}${this.short_name}:`;
	}
}

export async function selectReactionForResource(model: ReactionableModel) {
	const emoji = await EmojiSelectorModal.show({
		type: 'reactions',
		modelData: {
			type: 'resource',
			resource: model.resourceName,
			resourceId: model.id,
		},
	});

	if (!emoji) {
		return;
	}

	toggleReactionOnResource({
		model,
		emojiId: emoji.id,
		imgUrl: emoji.img_url,
		prefix: emoji.prefix,
		shortName: emoji.short_name,
	});
}

export async function toggleReactionOnResource({
	model,
	emojiId,
	prefix,
	shortName,
	imgUrl,
}: {
	model: ReactionableModel;
	emojiId: number;
	prefix: string;
	shortName: string;
	imgUrl: string;
}) {
	const existingReaction = model.reaction_counts.find(i => i.id === emojiId);

	// this means the reaction is new or the user never reacted to it before
	const isReacting = !existingReaction || !existingReaction.did_react;
	const countMod = isReacting ? 1 : -1;

	try {
		applyReaction({
			existing_reaction: existingReaction,
			count_mod: countMod,
			did_react: isReacting,
			model: model,
			emoji_id: emojiId,
			emoji_short_name: shortName,
			emoji_prefix: prefix,
			emoji_img_url: imgUrl,
		});

		// user might have reacted to this emoji before and
		// if it's still in the pending queue we need to update the count
		const pendingReactions = ModelsPendingReactions.get(model) ?? [];
		const pendingEmojiReaction = pendingReactions.find(i => i.emoji_id === emojiId);
		if (pendingEmojiReaction) {
			pendingEmojiReaction.count = pendingEmojiReaction.count + countMod;
		} else {
			pendingReactions.push({ emoji_id: emojiId, count: countMod });
			ModelsPendingReactions.set(model, pendingReactions); // is this needed?
		}

		const action = isReacting ? 'react' : 'unreact';

		const response = await Api.sendRequest(
			`/web/reactions/${action}`,
			{
				resource: model.resourceName,
				resourceId: model.id,
				emojiId: emojiId,
				timestamp: getCurrentServerTime(),
			},
			{ detach: true }
		);

		if (response.notProcessed) {
			return;
		}

		if (response.success === false) {
			throw response;
		}
	} catch (e) {
		let errorMessage = '';

		if (!isReacting) {
			errorMessage = $gettext(
				`You can't remove your reaction from this right now. Please try again later.`
			);
		} else if (
			(e instanceof AxiosError && e.response?.status === 403) ||
			(e instanceof PayloadError && e.status === 403)
		) {
			errorMessage = $gettext(`You haven't unlocked this reaction yet.`);
		} else {
			errorMessage = $gettext(`You can't react to this right now. Please try again later.`);
		}

		if (errorMessage) {
			showErrorGrowl(errorMessage);
		}

		// revert self reaction queue
		const pendingReactions = ModelsPendingReactions.get(model) ?? [];
		const pendingEmojiReaction = pendingReactions.find(i => i.emoji_id === emojiId);
		if (pendingEmojiReaction) {
			// revert current failed attempt of reacting to the emoji.
			// the emoji might have pending reactions from earlier successful attempts which we want to preserve.
			pendingEmojiReaction.count = pendingEmojiReaction.count - countMod;
		}

		const revertOnExistingReaction = existingReaction
			? existingReaction
			: model.reaction_counts.find(i => i.id === emojiId);

		// revert the reaction UI change
		applyReaction({
			existing_reaction: revertOnExistingReaction,
			count_mod: -countMod,
			did_react: !isReacting,
			model: model,
			emoji_id: emojiId,
			emoji_short_name: shortName,
			emoji_prefix: prefix,
			emoji_img_url: imgUrl,
		});
	}
}
