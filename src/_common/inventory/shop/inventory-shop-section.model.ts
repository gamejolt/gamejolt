import { ModelStoreModel } from '../../model/model-store.service';

export class InventoryShopSectionModel implements ModelStoreModel {
	declare id: number;
	declare title: string;
	declare description: string;
	declare sort: number;
	declare item_list: ShopSectionItemList | undefined;

	update(data: any) {
		Object.assign(this, data);
	}
}

interface ShopSectionItemList {
	id: number;
	sale_ids: number[];
}
