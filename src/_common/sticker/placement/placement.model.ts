import { Model } from '~common/model/model.service';
import { storeModel } from '~common/model/model-store.service';
import { StickerModel } from '~common/sticker/sticker.model';

export class StickerPlacementModel extends Model {
	declare position_x: number;
	declare position_y: number;
	declare rotation: number;
	declare sticker: StickerModel;
	declare is_charged: boolean;

	constructor(data: any = {}) {
		super(data);

		if (data.sticker) {
			this.sticker = storeModel(StickerModel, data.sticker);
		}
	}
}
