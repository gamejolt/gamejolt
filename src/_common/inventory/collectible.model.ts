import { Model, ModelData, UnknownModelData } from '../model/model.service';
import { User } from '../user/user.model';

type InventoryCollectibleType =
	| 'Sticker'
	| 'Site_Trophy'
	| 'Game_Trophy'
	| 'Background'
	| 'Avatar_Frame';

export class InventoryCollectible extends Model {
	declare type: InventoryCollectibleType;
	declare name: string;
	declare rarity: number;
	declare image_url: string;
	declare description: string;
	declare artist_user?: User;
	declare is_secret: boolean;
	declare is_unlocked: boolean;

	constructor(data: UnknownModelData | ModelData<InventoryCollectible> = {}) {
		super(data);

		if (data.artist_user) {
			this.artist_user = new User(data.artist_user);
		}
	}
}

Model.create(InventoryCollectible);
