import { arrayRemove } from '../../utils/array';
import { getCurrentServerTime } from '../../utils/server-time';
import { Api } from '../api/api.service';
import { EmojiSelectorModal } from '../emoji/selector-modal/modal.service';
import { showErrorGrowl } from '../growls/growls.service';
import { Model } from '../model/model.service';
import { $gettext } from '../translate/translate.service';

export abstract class ReactionableModel extends Model {
	declare reaction_counts: ReactionCount[];

	get typename__(): string {
		throw new Error('ReactionableModel must implement typename__');
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
			resource: model.typename__,
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

		const action = isReacting ? 'react' : 'unreact';
		const response = await Api.sendRequest(
			`/web/reactions/${action}`,
			{
				resource: model.typename__,
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
		if (isReacting) {
			showErrorGrowl($gettext('Could not react to this resource.'));
		} else {
			showErrorGrowl($gettext('Could not remove reaction from this resource.'));
		}

		const wasReacting = !isReacting;
		if (existingReaction) {
			const newCount = existingReaction.count - countMod;

			if (newCount <= 0) {
				arrayRemove(model.reaction_counts, i => i.id === emojiId);
			} else {
				existingReaction.count = newCount;
				existingReaction.did_react = wasReacting;
			}
		} else if (wasReacting) {
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
