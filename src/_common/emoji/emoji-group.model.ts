import { MediaItem } from '../media-item/media-item-model';
import { ModelStoreModel, storeModelList } from '../model/model-store.service';
import { Model } from '../model/model.service';
import { Emoji } from './emoji.model';

export class EmojiGroup implements ModelStoreModel {
	static readonly TYPE_LOCAL_RECENT = 'local-recent';

	static readonly TYPE_UNICODE = 'unicode';
	static readonly TYPE_LEGACY = 'legacy';
	static readonly TYPE_COLLECTION = 'sticker-collection';

	declare id: number;
	declare type: string;
	declare name: string;
	declare media_item?: MediaItem;
	declare num_emojis: number;
	declare added_on: number;
	declare emojis: Emoji[];

	constructor(data: any = {}) {
		this.update(data);
	}

	update(data: any = {}) {
		Object.assign(this, data);

		if (data.media_item) {
			this.media_item = new MediaItem(data.media_item);
		}

		if (data.emojis) {
			this.emojis = storeModelList(Emoji, data.emojis);
		} else if (!this.emojis) {
			this.emojis = [];
		}

		if (data.num_emojis < 0) {
			this.num_emojis = 0;
		}
	}

	get isRecentlyUsed() {
		return this.type === EmojiGroup.TYPE_LOCAL_RECENT && this.id <= 0;
	}
}

Model.create(EmojiGroup);
