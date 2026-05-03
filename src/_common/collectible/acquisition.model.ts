import { InventoryShopProductSaleModel } from '~common/inventory/shop/inventory-shop-product-sale.model';
import { ModelStoreModel, storeModel } from '~common/model/model-store.service';
import { UserModel } from '~common/user/user.model';

export const AcquisitionMethodPackOpen = 'pack-open';
export const AcquisitionMethodShopPurchase = 'shop-purchase';
export const AcquisitionMethodChargeReward = 'charge-reward';

export type AcquisitionMethod =
	| typeof AcquisitionMethodPackOpen
	| typeof AcquisitionMethodShopPurchase
	| typeof AcquisitionMethodChargeReward;

interface StickerPackFields {
	sticker_pack_id: number;
	sticker_pack_is_premium: boolean;
	sticker_pack_is_charge_reward: boolean;
}

interface PackOpenAcquisition extends StickerPackFields {
	id: string;
	method: typeof AcquisitionMethodPackOpen;
}

interface ChargeRewardAcquisition extends StickerPackFields {
	id: string;
	method: typeof AcquisitionMethodChargeReward;
	owner_user_id: number;
	owner_user?: UserModel;
}

interface ShopPurchaseAcquisition {
	id: string;
	method: typeof AcquisitionMethodShopPurchase;
	sale_id: number;
	sale?: InventoryShopProductSaleModel;
}

/** Filters and type-casts acquisitions based on the provided method. */
export function filterAcquisitionMethods<T extends AcquisitionMethod>(
	acquisitions: AcquisitionModel[],
	method: T
): T extends typeof AcquisitionMethodChargeReward
	? ChargeRewardAcquisition[]
	: T extends typeof AcquisitionMethodPackOpen
		? PackOpenAcquisition[]
		: T extends typeof AcquisitionMethodShopPurchase
			? ShopPurchaseAcquisition[]
			: never {
	return acquisitions.filter(i => i.method === method) as any;
}

export class AcquisitionModel implements ModelStoreModel {
	declare id: string;
	declare method: AcquisitionMethod;

	declare sticker_pack_id?: number;
	declare sticker_pack_is_premium?: boolean;
	declare sticker_pack_is_charge_reward?: boolean;

	declare owner_user_id?: number;
	declare owner_user?: UserModel;

	declare sale_id?: number;
	declare sale?: InventoryShopProductSaleModel;

	update(data: any) {
		Object.assign(this, data);

		if (data.owner_user) {
			this.owner_user = new UserModel(data.owner_user);
		}

		if (data.sale) {
			this.sale = storeModel(InventoryShopProductSaleModel, data.sale);
		}
	}
}
