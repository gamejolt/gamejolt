import { MediaItemModel } from '../media-item/media-item-model';
import { ModelStoreModel } from '../model/model-store.service';
import { ModelData, UnknownModelData } from '../model/model.service';
import { SellableModel } from '../sellable/sellable.model';

export type MicrotransactionProductType = 'joltbux';

export class MicrotransactionProductModel implements ModelStoreModel {
	declare id: number;
	declare store_product_id: string;
	declare product_type: MicrotransactionProductType;
	declare product_amount: number;
	declare display_name: string;
	declare media_item: MediaItemModel;
	declare sort: number;
	declare is_active: boolean;
	declare sellable?: SellableModel;

	constructor(data: UnknownModelData | ModelData<MicrotransactionProductModel> = {}) {
		this.update(data);
	}

	update(data: UnknownModelData | ModelData<MicrotransactionProductModel>) {
		Object.assign(this, data);

		if (data.media_item) {
			this.media_item = new MediaItemModel(data.media_item);
		}

		if (data.sellable) {
			this.sellable = new SellableModel(data.sellable);
		}
	}
}
