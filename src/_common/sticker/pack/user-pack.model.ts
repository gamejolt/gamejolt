import { ModelStoreModel, storeModel } from '../../model/model-store.service';
import { StickerPackModel } from './pack.model';

export class UserStickerPackModel implements ModelStoreModel {
	declare id: number;
	declare user_id: number;
	declare added_on: number;
	declare expires_on?: number;
	declare sticker_pack: StickerPackModel;

	update(data: Partial<UserStickerPackModel>) {
		Object.assign(this, data);

		if (data.sticker_pack) {
			this.sticker_pack = storeModel(StickerPackModel, data.sticker_pack);
		}
	}
}
