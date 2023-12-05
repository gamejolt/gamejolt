import { BackgroundModel } from '../background/background.model';
import { MediaItemModel } from '../media-item/media-item-model';
import { storeModel } from '../model/model-store.service';
import { Model } from '../model/model.service';
import { SiteTrophyModel } from '../site/trophy/trophy.model';
import { StickerRewardModel } from '../sticker/sticker-reward-model';

export const enum QuestRewardTypes {
	// Not ever used.
	//
	// TODO(quest-rewards) remove this, treat as `custom` or something. Change
	// to PascalCase.
	exp = 0,
	sticker = 1,
	siteTrophy = 2,
	randomSticker = 3,

	/**
	 * Should just use the fallback values so we can display it however backend
	 * wants to.
	 */
	custom = 4,
	background = 5,

	/**
	 * Adds charge to the StickerStore.
	 */
	userCharge = 6,
	coin = 7,
	stickerPack = 8,
	avatarFrame = 9,
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

	get isCharge() {
		return this.type === QuestRewardTypes.userCharge;
	}

	get isCoin() {
		return this.type === QuestRewardTypes.coin;
	}

	get isStickerPack() {
		return this.type === QuestRewardTypes.stickerPack;
	}

	get isAvatarFrame() {
		return this.type === QuestRewardTypes.avatarFrame;
	}

	get name() {
		let result = this.fallback_name;
		switch (this.type) {
			case QuestRewardTypes.sticker:
			case QuestRewardTypes.randomSticker:
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

			case QuestRewardTypes.userCharge:
				result = 'Charge';
				break;

			case QuestRewardTypes.coin:
				result = 'Coin';
				break;

			case QuestRewardTypes.stickerPack:
				result = 'Sticker pack';
				break;

			case QuestRewardTypes.avatarFrame:
				result = 'Avatar frame';
				break;
		}

		return result[0].toUpperCase() + result.slice(1);
	}
}
