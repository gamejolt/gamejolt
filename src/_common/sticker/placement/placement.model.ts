import { Model } from '../../model/model.service';
import { StickerModel } from '../sticker.model';

export class StickerPlacementModel extends Model {
	declare position_x: number;
	declare position_y: number;
	declare rotation: number;
	declare sticker: StickerModel;
	declare is_charged: boolean;

	constructor(data: any = {}) {
		super(data);

		if (data.sticker) {
			this.sticker = new StickerModel(data.sticker);
		}
	}
}
