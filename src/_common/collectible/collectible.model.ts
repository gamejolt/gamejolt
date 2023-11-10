import { ModelStoreModel } from '../model/model-store.service';
import { UserModel } from '../user/user.model';

export const enum CollectibleType {
	Sticker = 'Sticker',
	Background = 'Background',
	AvatarFrame = 'Avatar_Frame',
}

export const enum CollectibleAcquisitionMethod {
	// Opening a sticker pack.
	PackOpen = 'pack-open',
	// Purchasing a sale in a shop.
	ShopPurchase = 'shop-purchase',
	// Receive as a reward for placing charge.
	ChargeReward = 'charge-reward',
}

interface PackOpenAcquisition {
	method: CollectibleAcquisitionMethod.PackOpen;
	data: {
		pack: {
			id: number;
			is_premium?: boolean;
			is_charge_reward?: boolean;
		};
	};
}
interface ShopPurchaseAcquisition {
	method: CollectibleAcquisitionMethod.ShopPurchase;
	data: {
		sale: {
			id: number;
		};
	};
}
interface ChargeRewardAcquisition {
	method: CollectibleAcquisitionMethod.ChargeReward;
	data: {
		user: {
			id: number;
		};
	};
}
// TODO(collectible-sales) double-check all of these.
export type AcquisitionData =
	| PackOpenAcquisition
	| ShopPurchaseAcquisition
	| ChargeRewardAcquisition;

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

	acquisition: AcquisitionData[] = [];

	update(data: any) {
		Object.assign(this, data);

		const acquisitionData = data.acquisition;
		const newAcquisitions: AcquisitionData[] = [];

		if (acquisitionData && Array.isArray(acquisitionData)) {
			for (const i of acquisitionData) {
				if (!i || !i.method || typeof i.method !== 'string' || !i.data) {
					continue;
				}
				newAcquisitions.push({
					method: i.method,
					data: i.data,
				});
			}
		}
		this.acquisition = newAcquisitions;
	}
}

/** Filters and type-casts acquisitions based on the provided method. */
export function getCollectibleAcquisition(
	collectible: AcquisitionData[],
	method: CollectibleAcquisitionMethod.PackOpen
): PackOpenAcquisition[];
export function getCollectibleAcquisition(
	collectible: AcquisitionData[],
	method: CollectibleAcquisitionMethod.ShopPurchase
): ShopPurchaseAcquisition[];
export function getCollectibleAcquisition(
	collectible: AcquisitionData[],
	method: CollectibleAcquisitionMethod.ChargeReward
): ChargeRewardAcquisition[];
export function getCollectibleAcquisition<T extends CollectibleAcquisitionMethod>(
	acquisitions: AcquisitionData[],
	method: T
): AcquisitionData[] {
	return acquisitions.filter(i => i.method === method);
}
