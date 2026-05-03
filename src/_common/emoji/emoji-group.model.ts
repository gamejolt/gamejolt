import { EmojiModel } from '~common/emoji/emoji.model';
import { MediaItemModel } from '~common/media-item/media-item-model';
import { ModelStoreModel, storeModelList } from '~common/model/model-store.service';

export const EmojiGroupTypeLocalRecent = 'local-recent';
export const EmojiGroupTypeUnicode = 'unicode';
export const EmojiGroupTypeLegacy = 'legacy';
export const EmojiGroupTypeCollection = 'sticker-collection';

export type EmojiGroupType =
	| typeof EmojiGroupTypeLocalRecent
	| typeof EmojiGroupTypeUnicode
	| typeof EmojiGroupTypeLegacy
	| typeof EmojiGroupTypeCollection;

export class EmojiGroupModel implements ModelStoreModel {
	declare id: number;
	declare type: EmojiGroupType;
	declare name: string;
	declare media_item?: MediaItemModel;
	declare num_emojis: number;
	declare added_on: number;
	declare emojis: EmojiModel[];

	update(data: any = {}) {
		Object.assign(this, data);

		if (data.media_item) {
			this.media_item = new MediaItemModel(data.media_item);
		}

		if (data.emojis) {
			this.emojis = storeModelList(EmojiModel, data.emojis);
		} else if (!this.emojis) {
			this.emojis = [];
		}

		if (data.num_emojis < 0) {
			this.num_emojis = 0;
		}
	}

	get isRecentlyUsed() {
		return this.type === EmojiGroupTypeLocalRecent && this.id <= 0;
	}
}
