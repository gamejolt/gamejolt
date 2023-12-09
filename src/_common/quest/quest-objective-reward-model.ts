import { BackgroundModel } from '../background/background.model';
import { MediaItemModel } from '../media-item/media-item-model';
import { storeModel } from '../model/model-store.service';
import { Model } from '../model/model.service';
import { SiteTrophyModel } from '../site/trophy/trophy.model';
import { StickerRewardModel } from '../sticker/sticker-reward-model';

export const enum QuestRewardTypes {
	// Never used, old reward type.
	//
	// Exp = 0,
	Sticker = 1,
	SiteTrophy = 2,
	RandomSticker = 3,

	/**
	 * Should just use the fallback values so we can display it however backend
	 * wants to.
	 */
	Custom = 4,
	Background = 5,

	/**
	 * Adds charge to the StickerStore.
	 */
	UserCharge = 6,
	Coin = 7,
	StickerPack = 8,
	AvatarFrame = 9,
}

export class QuestObjectiveRewardModel extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.stickers) {
			this.stickers = StickerRewardModel.populate(data.stickers);
		}

		if (data.trophy) {
			this.trophy = new SiteTrophyModel(data.trophy);
		}

		if (data.background) {
			this.background = storeModel(BackgroundModel, data.background);
		}
	}

	declare objective_id: number;
	declare awarded_on: number;
	declare claimed_on: number;

	declare type: number;
	declare stickers: StickerRewardModel[];
	declare trophy?: SiteTrophyModel;
	declare background?: BackgroundModel;

	declare fallback_name: string;
	declare fallback_amount: number;
	declare fallback_media?: MediaItemModel;

	declare is_condensed?: boolean;

	get isSticker() {
		return (
			this.type === QuestRewardTypes.Sticker || this.type === QuestRewardTypes.RandomSticker
		);
	}

	get isTrophy() {
		return this.type === QuestRewardTypes.SiteTrophy;
	}

	get isBackground() {
		return this.type === QuestRewardTypes.Background;
	}

	get isCharge() {
		return this.type === QuestRewardTypes.UserCharge;
	}

	get isCoin() {
		return this.type === QuestRewardTypes.Coin;
	}

	get isStickerPack() {
		return this.type === QuestRewardTypes.StickerPack;
	}

	get isAvatarFrame() {
		return this.type === QuestRewardTypes.AvatarFrame;
	}

	get name() {
		let result = this.fallback_name;
		switch (this.type) {
			case QuestRewardTypes.Sticker:
			case QuestRewardTypes.RandomSticker:
				result = 'Sticker';
				break;

			case QuestRewardTypes.SiteTrophy:
				result = 'Trophy';
				break;

			case QuestRewardTypes.Background:
				result = 'Background';
				break;

			case QuestRewardTypes.UserCharge:
				result = 'Charge';
				break;

			case QuestRewardTypes.Coin:
				result = 'Coin';
				break;

			case QuestRewardTypes.StickerPack:
				result = 'Sticker pack';
				break;

			case QuestRewardTypes.AvatarFrame:
				result = 'Avatar frame';
				break;
		}

		return result[0].toUpperCase() + result.slice(1);
	}
}
