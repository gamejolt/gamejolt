import { Model, ModelData, UnknownModelData } from '../model/model.service';
import { $gettext } from '../translate/translate.service';
import { User } from '../user/user.model';

type InventoryCollectibleType =
	| 'Sticker'
	| 'Site_Trophy'
	| 'Game_Trophy'
	| 'Background'
	| 'Avatar_Frame';

export class InventoryCollectible extends Model {
	declare inventory_collection_id: string;
	declare type: InventoryCollectibleType;
	declare name: string;
	declare rarity: number;
	declare image_url: string;
	declare description: string;
	declare artist_user?: User;
	declare is_secret: boolean;
	declare is_unlocked: boolean;

	/** Only returned for sticker-type collectibles. Null if no progress. Otherwise percentage value 0-100. */
	declare sticker_mastery?: number | null;

	constructor(data: UnknownModelData | ModelData<InventoryCollectible> = {}) {
		super(data);

		if (data.artist_user) {
			this.artist_user = new User(data.artist_user);
		}
	}
}

Model.create(InventoryCollectible);

export function getCollectibleDisplayType(collectibleType: InventoryCollectibleType) {
	switch (collectibleType) {
		case 'Sticker':
			return $gettext('Sticker');
		case 'Background':
			return $gettext('Background');
		case 'Game_Trophy':
		case 'Site_Trophy':
			return $gettext('Trophy');
		case 'Avatar_Frame':
			return $gettext('Avatar Frame');
	}

	return $gettext('Collectible');
}

export function getCollectibleDisplayRarity(rarity: number) {
	switch (rarity) {
		case 1:
			return $gettext('Common');
		case 2:
			return $gettext('Uncommon');
		case 3:
			return $gettext('Rare');
		case 4:
			return $gettext('Epic');
	}

	return $gettext('Common');
}
