import { Model } from '../model/model.service';
import { StickerModel } from '../sticker/sticker.model';

export const QuestObjectiveStatus = {
	locked: 0,
	active: 1,
	complete: 2,
	incomplete: 3,
} as const;

export const QuestObjectiveType = {
	/** You don't need to do anything to complete this objective. */
	noop: 'noop',
	/**
	 * Objective will be marked as complete manually by us. Same as noop, only
	 * marks it as a special objective that appears "active" even before
	 * accepting the quest.
	 */
	manual: 'manual',
	questStart: 'quest-start',
	placeSticker: 'place-sticker',
	likePost: 'like-post',
	inviteFriend: 'invite-friend',
} as const;

export const QuestObjectiveMilestoneType = {
	continuous: 'continuous',
	segmented: 'segmented',
} as const;

export class QuestObjectiveModel extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.stickers_to_place) {
			this.stickers_to_place = StickerModel.populate(data.stickers_to_place);
		}
	}

	declare status: number;
	declare current_progress_ticks: number;
	declare last_progress_on: number;
	declare has_unclaimed_rewards: boolean;
	declare title: string;
	declare is_optional: boolean;
	declare type: string;
	declare max_progress_ticks: number;
	declare progress_visualization_type: string;
	declare sort: number;
	stickers_to_place: StickerModel[] = [];

	get isDisabled() {
		return this.status === QuestObjectiveStatus.locked
			? this.type !== QuestObjectiveType.questStart
			: false;
	}

	get hasProgressDisplay() {
		return this.max_progress_ticks >= 2;
	}

	get isPercent() {
		return this.progress_visualization_type === QuestObjectiveMilestoneType.continuous;
	}

	get isSegmented() {
		return this.progress_visualization_type === QuestObjectiveMilestoneType.segmented;
	}
}
