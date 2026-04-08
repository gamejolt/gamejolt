import { Model } from '../model/model.service';
import { storeModel } from '../model/model-store.service';
import { StickerModel } from './sticker.model';

export class StickerRewardModel extends Model {
	declare id: number;
	declare sticker: StickerModel;
	declare amount: number;

	constructor(data: any = {}) {
		super(data);

		if (data.sticker) {
			this.sticker = storeModel(StickerModel, data.sticker);
		}
	}
}
