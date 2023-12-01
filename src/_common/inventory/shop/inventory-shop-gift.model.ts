import { ModelStoreModel } from '../../model/model-store.service';
import { UserModel } from '../../user/user.model';
import {
	assignShopProductOwnerData,
	InventoryShopProduct,
	PurchasableProductType,
} from './product-owner-helpers';

export class InventoryShopGiftModel implements ModelStoreModel {
	declare id: number;

	declare from_user?: UserModel;
	declare to_user?: UserModel;

	declare product_type: PurchasableProductType;
	declare product?: InventoryShopProduct;

	declare can_accept: boolean;
	declare added_on?: number;

	update(data: any) {
		Object.assign(this, data);

		if (data.from_user) {
			this.from_user = new UserModel(data.from_user);
		}

		if (data.to_user) {
			this.to_user = new UserModel(data.to_user);
		}

		assignShopProductOwnerData(this, data);
	}
}
