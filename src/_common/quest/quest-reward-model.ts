import { MediaItemModel } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { QuestRewardTypes } from './quest-objective-reward-model';

/**
 * A reward for completing a quest objective that has not been achieved yet.
 * Used for example to display quest rewards before the user completed it.
 *
 * @see QuestObjectiveRewardModel for reward for completed objectives.
 */
export class QuestRewardModel extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.media) {
			this.media = new MediaItemModel(data.media);
		}
	}

	declare objective_id: number;
	declare type: QuestRewardTypes;
	declare is_condensed: boolean;
	declare is_secret: boolean;
	declare name: string;
	declare amount: number;
	declare media?: MediaItemModel;

	getGroupKey(): string {
		let key = this.type + '-' + this.name;
		if (this.media) {
			key += '-' + this.media.img_url;
		}

		return key;
	}
}
