import { ModelStoreModel } from '../../model/model-store.service';

export class InventoryShopSectionModel implements ModelStoreModel {
	declare id: number;
	declare title: string;
	declare description: string;
	declare sort: number;
	declare resource: ShopSectionInterface;

	update(data: any) {
		Object.assign(this, data);
	}
}

interface ShopSectionInterface {
	id: number;
	items: ShopSectionItem[];
}

interface ShopSectionItem {
	id: number;
	sale_id: number;
	sort: number;
}
