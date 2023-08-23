import { Model } from '../../model/model.service';
import { Sticker } from '../sticker.model';

export class StickerPlacement extends Model {
	declare position_x: number;
	declare position_y: number;
	declare rotation: number;
	declare sticker: Sticker;
	declare target_data: StickerPlacementTargetData;
	declare is_charged: boolean;

	constructor(data: any = {}) {
		super(data);

		if (data.sticker) {
			this.sticker = new Sticker(data.sticker);
		}

		if (data.target_data === '' || !data.target_data) {
			this.target_data = {};
		}
	}
}

export interface StickerPlacementTargetData {
	host_user_id?: number;
}
