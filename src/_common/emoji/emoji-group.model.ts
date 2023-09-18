import { MediaItemModel } from '../media-item/media-item-model';
import { ModelStoreModel, storeModelList } from '../model/model-store.service';
import { EmojiModel } from './emoji.model';

export const enum EmojiGroupType {
	LocalRecent = 'local-recent',
	Unicode = 'unicode',
	Legacy = 'legacy',
	Collection = 'sticker-collection',
}

export class EmojiGroupModel implements ModelStoreModel {
	static readonly TYPE_LOCAL_RECENT = 'local-recent';

	static readonly TYPE_UNICODE = 'unicode';
	static readonly TYPE_LEGACY = 'legacy';
	static readonly TYPE_COLLECTION = 'sticker-collection';

	declare id: number;
	declare type: EmojiGroupType;
	declare name: string;
	declare media_item?: MediaItemModel;
	declare num_emojis: number;
	declare added_on: number;
	declare emojis: EmojiModel[];

	constructor(data: any = {}) {
		this.update(data);
	}

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
		return this.type === EmojiGroupType.LocalRecent && this.id <= 0;
	}
}
