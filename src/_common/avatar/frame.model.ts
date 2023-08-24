import { Model } from '../model/model.service';

export class AvatarFrameModel extends Model {
	declare image_url: string;
	declare name?: string;
	declare rarity?: number;
	declare description?: string;

	constructor(data: any = {}) {
		super(data);
	}
}
