import { MediaItem } from '../media-item/media-item-model';
import { Model, ModelData, UnknownModelData } from '../model/model.service';
import { User } from '../user/user.model';

export const COLLECTION_TYPE_USER = 'user';
export const COLLECTION_TYPE_GAME = 'game';
export const COLLECTION_TYPE_GAMEJOLT = 'gamejolt';

export type CollectionType =
	| typeof COLLECTION_TYPE_USER
	| typeof COLLECTION_TYPE_GAME
	| typeof COLLECTION_TYPE_GAMEJOLT;

export class InventoryCollection extends Model {
	declare name: string;
	declare type: CollectionType;
	declare description: string;
	declare owner_user?: User;
	declare started_on: number | null;
	declare ended_on: number | null;
	declare header_media_item?: MediaItem;

	constructor(data: UnknownModelData | ModelData<InventoryCollection> = {}) {
		super(data);

		if (data.owner_user) {
			this.owner_user = new User(data.owner_user);
		}
		if (data.header_media_item) {
			this.header_media_item = new MediaItem(data.header_media_item);
		}
	}
}

Model.create(InventoryCollection);
