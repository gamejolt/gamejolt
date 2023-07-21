import { Model, defineLegacyModel } from '../model/model.service';

export class AvatarFrame extends defineLegacyModel(
	class AvatarFrameDefinition extends Model {
		declare image_url: string;
		declare name?: string;
		declare rarity?: number;
		declare description?: string;

		constructor(data: any = {}) {
			super(data);
		}
	}
) {}
