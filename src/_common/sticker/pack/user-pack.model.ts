import { Model } from '../../model/model.service';
import { StickerPackModel } from './pack.model';

export class UserStickerPackModel extends Model {
	declare user_id: number;
	declare added_on: number;
	declare expires_on?: number;

	declare sticker_pack: StickerPackModel;

	constructor(data: Partial<UserStickerPackModel> = {}) {
		super(data);

		if (data.sticker_pack) {
			this.sticker_pack = new StickerPackModel(data.sticker_pack);
		}
	}
}
