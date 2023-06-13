import { AxiosError } from 'axios';
import { arrayRemove } from '../../utils/array';
import { getCurrentServerTime } from '../../utils/server-time';
import { Api } from '../api/api.service';
import { EmojiSelectorModal } from '../emoji/selector-modal/modal.service';
import { showErrorGrowl } from '../growls/growls.service';
import { PayloadError } from '../payload/payload-service';
import { $gettext } from '../translate/translate.service';

export interface EmojiDelta {
	emoji_id: number;
	emoji_short_name: string;
	emoji_prefix: string;
	emoji_img_url: string;

	// user ids which reacted / unreacted to this emoji
	delta_inc: number[];
	delta_dec: number[];
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
const ReactionQueue = new WeakMap<ReactionableModel, EmojiIdAndCount[]>();

function applyReaction(
	model: ReactionableModel,
	existingReaction: ReactionCount | undefined,
	countMod: number,
	emojiId: number,
	emojiImgUrl: string,
	emojiPrefix: string,
	emojiShortName: string,
	didReact: boolean
) {
	if (existingReaction) {
		if (existingReaction.count + countMod <= 0) {
			arrayRemove(model.reaction_counts, i => i.id === emojiId);
		} else {
			existingReaction.count = existingReaction.count + countMod;
			existingReaction.did_react = didReact;
		}
	} else if (countMod > 0) {
		model.reaction_counts.push(
			new ReactionCount({
				id: emojiId,
				img_url: emojiImgUrl,
				prefix: emojiPrefix,
				short_name: emojiShortName,
				count: countMod,
				did_react: didReact,
			})
		);
	}
}

export async function updateReactionCountForAnEmoji(
	model: ReactionableModel,
	emojiId: number,
	emojiShortName: string,
	emojiPrefix: string,
	emojiImgUrl: string,
	deltaInc: number[],
	deltaDec: number[],
	current_user_id: number
) {
	let countMod = deltaInc.length - deltaDec.length;

	// we need to cancel out the self reactions (applied earlier) from the payload we receive
	const modelSelfReactionQueue = ReactionQueue.get(model) ?? [];
	if (modelSelfReactionQueue.length) {
		const emojiSelfReactionQueue = modelSelfReactionQueue.find(i => i.emoji_id === emojiId);
		if (emojiSelfReactionQueue) {
			countMod = countMod - emojiSelfReactionQueue.count;
			arrayRemove(modelSelfReactionQueue, i => i.emoji_id === emojiId);
			ReactionQueue.set(model, modelSelfReactionQueue);
		}
	}

	const existingReaction = model.reaction_counts.find(i => i.id === emojiId);
	const user_reacting = deltaInc.includes(current_user_id);
	const user_unreacting = deltaDec.includes(current_user_id);

	const didReact =
		(existingReaction &&
			// user haven't reacted before and is now reacting
			((!existingReaction.did_react && user_reacting) ||
				// user reacted before and maintaining reaction
				(existingReaction.did_react && !user_unreacting))) ||
		// fresh reaction
		user_reacting;

	// if the nett count is 0, no need to update the UI only if
	if (countMod == 0) {
		// this is a new reaction or user's did_react on the emoji is the same as before
		if (!existingReaction || existingReaction.did_react === didReact) {
			return;
		}
	}

	applyReaction(
		model,
		existingReaction,
		countMod,
		emojiId,
		emojiImgUrl,
		emojiPrefix,
		emojiShortName,
		didReact
	);
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
		applyReaction(
			model,
			existingReaction,
			countMod,
			emojiId,
			imgUrl,
			prefix,
			shortName,
			isReacting
		);

		const modelSelfReactionQueue = ReactionQueue.get(model) ?? [];
		const emojiSelfReactionQueue = modelSelfReactionQueue.find(i => i.emoji_id === emojiId);
		if (emojiSelfReactionQueue) {
			emojiSelfReactionQueue.count = emojiSelfReactionQueue.count + countMod;
		} else {
			modelSelfReactionQueue.push({ emoji_id: emojiId, count: countMod });
			ReactionQueue.set(model, modelSelfReactionQueue);
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
		const modelSelfReactionQueue = ReactionQueue.get(model) ?? [];
		if (modelSelfReactionQueue.some(i => i.emoji_id === emojiId)) {
			arrayRemove(modelSelfReactionQueue, i => i.emoji_id === emojiId);
			ReactionQueue.set(model, modelSelfReactionQueue);
		}

		const revertOnExistingReaction = existingReaction
			? existingReaction
			: model.reaction_counts.find(i => i.id === emojiId);

		// revert the reaction UI change
		applyReaction(
			model,
			revertOnExistingReaction,
			isReacting ? -1 : 1,
			emojiId,
			imgUrl,
			prefix,
			shortName,
			!isReacting
		);
	}
}
