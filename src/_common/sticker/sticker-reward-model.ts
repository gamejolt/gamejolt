import { Model } from '../model/model.service';
import { StickerModel } from './sticker.model';

export class StickerRewardModel extends Model {
	constructor(data: any = {}) {
		super(data);
	}

	declare id: number;
	declare sticker: StickerModel;
	declare amount: number;
}
