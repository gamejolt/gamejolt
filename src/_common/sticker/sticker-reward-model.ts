import { Model } from '../model/model.service';
import { StickerModel } from './sticker.model';

export class StickerRewardModel extends Model {
	constructor(data: any = {}) {
		super(data);

		if (data.sticker) {
			this.sticker = new StickerModel(data.sticker);
		}
	}

	declare id: number;
	declare sticker: StickerModel;
	declare amount: number;
}
