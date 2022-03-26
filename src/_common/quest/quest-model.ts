import { Model } from '../model/model.service';
import { MediaItem } from '../media-item/media-item-model';
import { QuestObjective } from './quest-objective-model';

export const QuestStatus = {
	inactive: 0,
	active: 1,
	/** The quest has not been accepted yet. */
	available: 2,
} as const;

export const QuestCompletionState = {
	/** Has incomplete required objectives */
	incomplete: 0,
	/** Required objectives completed */
	complete: 1,
	/** Every objective complete, including optional */
	allComplete: 2,
} as const;

export class Quest extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.avatar) {
			this.avatar = new MediaItem(data.avatar);
		}

		if (data.header) {
			this.header = new MediaItem(data.header);
		}

		if (data.objectives) {
			this.objectives = QuestObjective.populate(data.objectives);
		}
	}

	declare status: number;
	declare started_on: number;
	declare avatar: MediaItem;
	declare header: MediaItem;
	declare description: string;
	declare description_content: string;
	declare title: string;
	declare quest_type?: string;
	declare ends_on: number;
	declare completion_state: number;
	declare progress_percent: number;
	declare is_new: boolean;
	declare has_activity: boolean;
	objectives: QuestObjective[] = [];

	get isActive() {
		return this.status === QuestStatus.active;
	}

	get canAccept() {
		return this.status === QuestStatus.available;
	}

	get isExpired() {
		if (this.status === QuestStatus.inactive) {
			return true;
		}

		return this.ends_on && this.ends_on < Date.now();
	}

	get isIncomplete() {
		if (this.canAccept) {
			return true;
		}

		return this.completion_state === QuestCompletionState.incomplete;
	}

	get isComplete() {
		if (this.canAccept) {
			return false;
		}

		return this.completion_state === QuestCompletionState.complete;
	}

	get isAllComplete() {
		if (this.canAccept) {
			return false;
		}

		return this.completion_state === QuestCompletionState.allComplete;
	}
}

Model.create(Quest);
