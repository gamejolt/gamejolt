import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';

/**
 * A reward for completing a quest objective that has not been achieved yet.
 * Used for example to display quest rewards before the user completed it.
 *
 * @see QuestObjectiveReward for reward for completed objectives.
 */
export class QuestReward extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.media) {
			this.media = new MediaItem(data.media);
		}
	}

	declare objective_id: number;
	declare type: number;
	declare is_condensed: boolean;
	declare is_secret: boolean;
	declare name: string;
	declare amount: number;
	declare media?: MediaItem;

	getGroupKey(): string {
		let key = this.type + '-' + this.name;
		if (this.media) {
			key += '-' + this.media.img_url;
		}

		return key;
	}
}

Model.create(QuestReward);
