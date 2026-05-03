import { BackgroundModel } from '~common/background/background.model';
import { MediaItemModel } from '~common/media-item/media-item-model';
import { Model } from '~common/model/model.service';
import { storeModel } from '~common/model/model-store.service';
import { SiteTrophyModel } from '~common/site/trophy/trophy.model';
import { StickerRewardModel } from '~common/sticker/sticker-reward-model';

export const QuestRewardTypesSticker = 1;
export const QuestRewardTypesSiteTrophy = 2;
export const QuestRewardTypesRandomSticker = 3;
export const QuestRewardTypesCustom = 4;
export const QuestRewardTypesBackground = 5;
export const QuestRewardTypesUserCharge = 6;
export const QuestRewardTypesCoin = 7;
export const QuestRewardTypesStickerPack = 8;
export const QuestRewardTypesAvatarFrame = 9;

export type QuestRewardTypes =
	| typeof QuestRewardTypesSticker
	| typeof QuestRewardTypesSiteTrophy
	| typeof QuestRewardTypesRandomSticker
	| typeof QuestRewardTypesCustom
	| typeof QuestRewardTypesBackground
	| typeof QuestRewardTypesUserCharge
	| typeof QuestRewardTypesCoin
	| typeof QuestRewardTypesStickerPack
	| typeof QuestRewardTypesAvatarFrame;

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
		return this.type === QuestRewardTypesSticker || this.type === QuestRewardTypesRandomSticker;
	}

	get isTrophy() {
		return this.type === QuestRewardTypesSiteTrophy;
	}

	get isBackground() {
		return this.type === QuestRewardTypesBackground;
	}

	get isCharge() {
		return this.type === QuestRewardTypesUserCharge;
	}

	get isCoin() {
		return this.type === QuestRewardTypesCoin;
	}

	get isStickerPack() {
		return this.type === QuestRewardTypesStickerPack;
	}

	get isAvatarFrame() {
		return this.type === QuestRewardTypesAvatarFrame;
	}

	get name() {
		let result = this.fallback_name;
		switch (this.type) {
			case QuestRewardTypesSticker:
			case QuestRewardTypesRandomSticker:
				result = 'Sticker';
				break;

			case QuestRewardTypesSiteTrophy:
				result = 'Trophy';
				break;

			case QuestRewardTypesBackground:
				result = 'Background';
				break;

			case QuestRewardTypesUserCharge:
				result = 'Charge';
				break;

			case QuestRewardTypesCoin:
				result = 'Coin';
				break;

			case QuestRewardTypesStickerPack:
				result = 'Sticker pack';
				break;

			case QuestRewardTypesAvatarFrame:
				result = 'Avatar frame';
				break;
		}

		return result[0].toUpperCase() + result.slice(1);
	}
}
