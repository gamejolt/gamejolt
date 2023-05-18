import { MediaItem } from '../media-item/media-item-model';
import { Model, ModelData, UnknownModelData } from '../model/model.service';

export type MicrotransactionProductType = 'joltbux';

export class MicrotransactionProduct extends Model {
	store_product_id!: string;
	product_type!: MicrotransactionProductType;
	product_amount!: number;
	display_name!: string;
	media_item!: MediaItem;
	sort!: number;
	is_active!: boolean;

	constructor(data: UnknownModelData | ModelData<MicrotransactionProduct> = {}) {
		super(data);

		if (data.media_item) {
			this.media_item = new MediaItem(data.media_item);
		}
	}
}

Model.create(MicrotransactionProduct);
