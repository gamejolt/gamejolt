import { MediaItem } from '../media-item/media-item-model';
import { ModelStoreModel } from '../model/model-store.service';
import { ModelData, UnknownModelData } from '../model/model.service';
import { Sellable } from '../sellable/sellable.model';

export type MicrotransactionProductType = 'joltbux';

export class MicrotransactionProduct implements ModelStoreModel {
	declare id: number;
	declare store_product_id: string;
	declare product_type: MicrotransactionProductType;
	declare product_amount: number;
	declare display_name: string;
	declare media_item: MediaItem;
	declare sort: number;
	declare is_active: boolean;
	declare sellable?: Sellable;

	constructor(data: UnknownModelData | ModelData<MicrotransactionProduct> = {}) {
		this.update(data);
	}

	update(data: UnknownModelData | ModelData<MicrotransactionProduct>) {
		Object.assign(this, data);

		if (data.media_item) {
			this.media_item = new MediaItem(data.media_item);
		}

		if (data.sellable) {
			this.sellable = new Sellable(data.sellable);
		}
	}
}
