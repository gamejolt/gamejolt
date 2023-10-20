import { ModelStoreModel } from '../model/model-store.service';
import { UserModel } from '../user/user.model';

export const enum CollectibleType {
	Sticker = 'Sticker',
	Background = 'Background',
	AvatarFrame = 'Avatar_Frame',
}

export class CollectibleModel implements ModelStoreModel {
	declare id: string;
	declare inventory_collection_id: string;
	declare type: CollectibleType;
	declare name: string;
	declare rarity: number;
	declare image_url: string;
	declare description: string;
	declare artist_user?: UserModel;
	declare is_secret: boolean;
	declare is_unlocked: boolean;
	declare sticker_mastery?: number;

	update(data: any) {
		Object.assign(this, data);
	}
}
