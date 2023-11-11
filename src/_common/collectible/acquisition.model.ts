import { InventoryShopProductSaleModel } from '../inventory/shop/inventory-shop-product-sale.model';
import { ModelStoreModel, storeModel } from '../model/model-store.service';
import { UserModel } from '../user/user.model';

export const enum AcquisitionMethod {
	/** Opening a sticker pack. */
	PackOpen = 'pack-open',
	/** Purchasing a sale in a shop. */
	ShopPurchase = 'shop-purchase',
	/** Receive as a reward for placing charge. */
	ChargeReward = 'charge-reward',
}

interface StickerPackFields {
	sticker_pack_id: number;
	sticker_pack_is_premium: boolean;
	sticker_pack_is_charge_reward: boolean;
}

interface PackOpenAcquisition extends StickerPackFields {
	id: string;
	method: AcquisitionMethod.PackOpen;
}

interface ChargeRewardAcquisition extends StickerPackFields {
	id: string;
	method: AcquisitionMethod.ChargeReward;
	owner_user_id: number;
	owner_user?: UserModel;
}

interface ShopPurchaseAcquisition {
	id: string;
	method: AcquisitionMethod.ShopPurchase;
	sale_id: number;
	sale?: InventoryShopProductSaleModel;
}

/** Filters and type-casts acquisitions based on the provided method. */
export function filterAcquisitionMethods<T extends AcquisitionMethod>(
	acquisitions: AcquisitionModel[],
	method: T
): T extends AcquisitionMethod.ChargeReward
	? ChargeRewardAcquisition[]
	: T extends AcquisitionMethod.PackOpen
	? PackOpenAcquisition[]
	: T extends AcquisitionMethod.ShopPurchase
	? ShopPurchaseAcquisition[]
	: never {
	return acquisitions.filter(i => i.method === method) as any;
}

export class AcquisitionModel implements ModelStoreModel {
	declare id: number;
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
