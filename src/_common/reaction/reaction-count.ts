import { AxiosError } from 'axios';
import { arrayRemove } from '../../utils/array';
import { getCurrentServerTime } from '../../utils/server-time';
import { Api } from '../api/api.service';
import { showEmojiSelectorModal } from '../emoji/selector-modal/modal.service';
import { showErrorGrowl } from '../growls/growls.service';
import { PayloadError } from '../payload/payload-service';
import { $gettext } from '../translate/translate.service';

export interface ReactionableModel {
	id: number;
	reaction_counts: ReactionCount[];
	/**
	 * Map of `emoji_id` to the local count diff.
	 *
	 * Local count diff is used to modify outside Grid event data to determine
	 * if that message data was already handled properly, or if it came from a
	 * different session.
	 */
	reaction_counts_queue: Map<number, number>;

	get resourceName(): string;
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
	const emoji = await showEmojiSelectorModal({
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
	const emojiData: ReactionData = {
		emojiId,
		emojiImgUrl: imgUrl,
		emojiPrefix: prefix,
		emojiShortName: shortName,
	};

	const existingReaction = model.reaction_counts.find(i => i.id === emojiId);

	// this means the reaction is new or the user never reacted to it before
	const isReacting = !existingReaction || !existingReaction.did_react;
	const countModifier = isReacting ? 1 : -1;

	try {
		applyReaction(
			{
				existingReaction,
				countDiff: countModifier,
				didReact: isReacting,
				model,
			},
			emojiData
		);

		// Update/add our local count mutation in the queue.
		const localCountMutation = model.reaction_counts_queue.get(emojiId) || 0;
		model.reaction_counts_queue.set(emojiId, localCountMutation + countModifier);

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

		// Revert our pending reaction change.
		let localCountMutation = model.reaction_counts_queue.get(emojiId) ?? 0;
		localCountMutation -= countModifier;

		// If our local count mutation is 0, we can safely remove it. Otherwise,
		// we should update with the new count mutation.
		if (localCountMutation === 0) {
			model.reaction_counts_queue.delete(emojiId);
		} else {
			model.reaction_counts_queue.set(emojiId, localCountMutation);
		}

		applyReaction(
			{
				existingReaction: model.reaction_counts.find(i => i.id === emojiId),
				countDiff: -countModifier,
				didReact: !isReacting,
				model,
			},
			emojiData
		);
	}
}

interface ReactionData {
	emojiId: number;
	emojiShortName: string;
	emojiPrefix: string;
	emojiImgUrl: string;
}

interface ReactionUserDeltas {
	deltaInc: number[];
	deltaDec: number[];
}

export interface RealtimeReactionsPayload {
	emoji_id: number;
	emoji_short_name: string;
	emoji_prefix: string;
	emoji_img_url: string;
	delta_inc: number[];
	delta_dec: number[];
}

interface ApplyReactionOptions {
	existingReaction: ReactionCount | undefined;
	model: ReactionableModel;
	countDiff: number;
	didReact: boolean;
}

interface UpdateReactionCountOptions {
	currentUserId: number;
	model: ReactionableModel;
}

function applyReaction(
	{ existingReaction, countDiff, didReact, model }: ApplyReactionOptions,
	{ emojiId, emojiImgUrl, emojiPrefix, emojiShortName }: ReactionData
) {
	const newCount = (existingReaction?.count ?? 0) + countDiff;
	if (existingReaction) {
		if (newCount > 0) {
			existingReaction.count = newCount;
			existingReaction.did_react = didReact;
			return;
		}
		arrayRemove(model.reaction_counts, i => i.id === emojiId);
		return;
	}

	if (newCount > 0) {
		model.reaction_counts.push(
			new ReactionCount({
				id: emojiId,
				img_url: emojiImgUrl,
				prefix: emojiPrefix,
				short_name: emojiShortName,
				count: countDiff,
				did_react: didReact,
			})
		);
		return;
	}

	console.error('Tried adding reaction with a non-positive count.', {
		count: newCount,
		emojiId,
	});
}

export async function updateReactionCount(
	{ currentUserId, model }: UpdateReactionCountOptions,
	deltas: ReactionUserDeltas,
	emojiData: ReactionData
) {
	const { emojiId } = emojiData;
	const { deltaInc, deltaDec } = deltas;

	const userReactingCount = deltaInc.filter(id => id === currentUserId).length;
	const userUnreactingCount = deltaDec.filter(id => id === currentUserId).length;
	let countDiff = deltaInc.length - deltaDec.length;

	// Get the current user's count diff across tabs.
	let localNetCountDiff = userReactingCount - userUnreactingCount;

	// Offset our incoming diffs with our local diffs so we can ignore incoming
	// events that this device initiated itself.
	if (model.reaction_counts_queue.has(emojiId)) {
		const localReactionMutation = model.reaction_counts_queue.get(emojiId) ?? 0;
		countDiff -= localReactionMutation;
		localNetCountDiff -= localReactionMutation;
		// Remove from the queue now that we're handling the local diffs.
		model.reaction_counts_queue.delete(emojiId);
	}

	// If our count change isn't 0, we're either removing (-1) or adding (+1)
	// our reaction and should modify the didReact state.
	const shouldChangeDidReact = localNetCountDiff !== 0;

	// Nothing to do if the count diff is 0 and we're not updating our didReact
	// state.
	if (countDiff === 0 && !shouldChangeDidReact) {
		return;
	}

	const existingReaction = model.reaction_counts.find(i => i.id === emojiId);
	let didReact = !!existingReaction && existingReaction.did_react;
	if (shouldChangeDidReact) {
		didReact = !didReact;
	}

	applyReaction(
		{
			existingReaction,
			countDiff: countDiff,
			didReact,
			model,
		},
		emojiData
	);
}
