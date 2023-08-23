import { Model } from '../model/model.service';
import { Sticker } from './sticker.model';

export class StickerReward extends Model {
	constructor(data: any = {}) {
		super(data);
	}

	declare id: number;
	declare sticker: Sticker;
	declare amount: number;
}
