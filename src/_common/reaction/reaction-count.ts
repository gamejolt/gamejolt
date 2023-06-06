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

export async function updateReactionCount(
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
	const selfReactionQueue = ReactionQueue.get(model) ?? [];
	if (selfReactionQueue.length) {
		const selfReacted = selfReactionQueue.find(i => i.emoji_id === emojiId);
		if (selfReacted) {
			countMod = countMod - selfReacted.count;
			arrayRemove(selfReactionQueue, i => i.emoji_id === emojiId);
			ReactionQueue.set(model, selfReactionQueue);
		}
	}

	if (countMod == 0) {
		return;
	}

	const existingReaction = model.reaction_counts.find(i => i.id === emojiId);
	if (existingReaction) {
		if (existingReaction.count + countMod <= 0) {
			arrayRemove(model.reaction_counts, i => i.id === emojiId);
		} else {
			existingReaction.count = existingReaction.count + countMod;

			existingReaction.did_react =
				// we haven't reacted yet and now we're in the deltaInc list => did_react = true
				(!existingReaction.did_react && deltaInc.includes(current_user_id)) ||
				// we have reacted and now we're not in the deltaDec list => did_react = true
				(existingReaction.did_react && !deltaDec.includes(current_user_id));
			// everything else is false
		}
	} else {
		model.reaction_counts.push(
			new ReactionCount({
				id: emojiId,
				img_url: emojiImgUrl,
				prefix: emojiPrefix,
				short_name: emojiShortName,
				count: countMod,
				did_react: deltaInc.includes(current_user_id),
			})
		);
	}
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
		if (existingReaction) {
			if (existingReaction.count + countMod <= 0) {
				arrayRemove(model.reaction_counts, i => i.id === emojiId);
			} else {
				existingReaction.count = existingReaction.count + countMod;
				existingReaction.did_react = isReacting;
			}
		} else if (isReacting) {
			model.reaction_counts.push(
				new ReactionCount({
					id: emojiId,
					count: 1,
					img_url: imgUrl,
					prefix: prefix,
					short_name: shortName,
					did_react: true,
				})
			);
		}

		const selfReactionQueue = ReactionQueue.get(model) ?? [];
		selfReactionQueue.push({ emoji_id: emojiId, count: countMod });
		ReactionQueue.set(model, selfReactionQueue);

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

		const wasReacted = !isReacting;
		if (existingReaction) {
			const newCount = existingReaction.count - countMod;

			if (newCount <= 0) {
				arrayRemove(model.reaction_counts, i => i.id === emojiId);
			} else {
				existingReaction.count = newCount;
				existingReaction.did_react = wasReacted;
			}
		} else if (wasReacted) {
			model.reaction_counts.push(
				new ReactionCount({
					id: emojiId,
					count: 1,
					img_url: imgUrl,
					prefix: prefix,
					short_name: shortName,
					did_react: true,
				})
			);
		}
	}
}
