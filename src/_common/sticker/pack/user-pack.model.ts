import { Model } from '../../model/model.service';
import { StickerPack } from './pack.model';

export class UserStickerPack extends Model {
	declare user_id: number;
	declare added_on: number;
	declare expires_on?: number;

	declare sticker_pack: StickerPack;

	constructor(data: Partial<UserStickerPack> = {}) {
		super(data);

		if (data.sticker_pack) {
			this.sticker_pack = new StickerPack(data.sticker_pack);
		}
	}
}
