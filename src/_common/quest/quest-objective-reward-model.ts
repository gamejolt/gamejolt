import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { SiteTrophy } from '../site/trophy/trophy.model';
import { StickerReward } from '../sticker/sticker-reward-model';

const QuestRewardTypes = {
	exp: 0,
	sticker: 1,
	siteTrophy: 2,
	randomSticker: 3,
} as const;

export class QuestObjectiveReward extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.stickers) {
			this.stickers = StickerReward.populate(data.stickers);
		}

		if (data.trophy) {
			this.trophy = new SiteTrophy(data.trophy);
		}
	}

	declare objective_id: number;
	declare awarded_on: number;
	declare claimed_on: number;

	declare type: number;
	declare stickers: StickerReward[];
	declare trophy?: SiteTrophy;

	declare fallback_name: string;
	declare fallback_amount: number;
	declare fallback_media?: MediaItem;

	get isSticker() {
		return (
			this.type === QuestRewardTypes.sticker || this.type === QuestRewardTypes.randomSticker
		);
	}

	get isExp() {
		return this.type === QuestRewardTypes.exp;
	}

	get isTrophy() {
		return this.type === QuestRewardTypes.siteTrophy;
	}

	get name() {
		let result = this.fallback_name;
		switch (this.type) {
			case QuestRewardTypes.sticker:
				result = 'Sticker';
				break;

			case QuestRewardTypes.exp:
				result = 'Experience';
				break;

			case QuestRewardTypes.siteTrophy:
				result = 'Trophy';
				break;
		}

		return result[0].toUpperCase() + result.slice(1);
	}
}

Model.create(QuestObjectiveReward);
