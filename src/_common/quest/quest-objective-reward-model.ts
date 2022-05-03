import { MediaItem } from '../media-item/media-item-model';
import { Model } from '../model/model.service';
import { SiteTrophy } from '../site/trophy/trophy.model';
import { StickerReward } from '../sticker/sticker-reward-model';
import { Background } from '../background/background.model';

const QuestRewardTypes = {
	exp: 0,
	sticker: 1,
	siteTrophy: 2,
	randomSticker: 3,

	/**
	 * Should just use the fallback values so we can display it however backend
	 * wants to.
	 */
	custom: 4,
	background: 5,
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

		if (data.background) {
			this.background = new Background(data.background);
		}
	}

	declare objective_id: number;
	declare awarded_on: number;
	declare claimed_on: number;

	declare type: number;
	declare stickers: StickerReward[];
	declare trophy?: SiteTrophy;
	declare background?: Background;

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

	get isBackground() {
		return this.type === QuestRewardTypes.background;
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

			case QuestRewardTypes.background:
				result = 'Background';
				break;
		}

		return result[0].toUpperCase() + result.slice(1);
	}
}

Model.create(QuestObjectiveReward);
