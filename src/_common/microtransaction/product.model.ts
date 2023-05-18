import { MediaItem } from '../media-item/media-item-model';
import { Model, ModelData, UnknownModelData } from '../model/model.service';
import { Sellable } from '../sellable/sellable.model';

export type MicrotransactionProductType = 'joltbux';

export class MicrotransactionProduct extends Model {
	store_product_id!: string;
	product_type!: MicrotransactionProductType;
	product_amount!: number;
	display_name!: string;
	media_item!: MediaItem;
	sort!: number;
	is_active!: boolean;
	sellable?: Sellable;

	constructor(data: UnknownModelData | ModelData<MicrotransactionProduct> = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItem(data.media_item);
		}

		if (data.sellable) {
			this.sellable = new Sellable(data.sellable);
		}
	}
}

Model.create(MicrotransactionProduct);
