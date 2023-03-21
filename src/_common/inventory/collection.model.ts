import { Model, ModelData, UnknownModelData } from '../model/model.service';
import { User } from '../user/user.model';
import { InventoryCollectible } from './collectible.model';

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

	declare user_collectibles: InventoryCollectible[];

	constructor(data: UnknownModelData | ModelData<InventoryCollection> = {}) {
		super(data);

		if (data.owner_user) {
			this.owner_user = new User(data.owner_user);
		}
		if (data.user_collectibles) {
			this.user_collectibles = InventoryCollectible.populate(data.user_collectibles);
		}
	}
}

Model.create(InventoryCollection);
