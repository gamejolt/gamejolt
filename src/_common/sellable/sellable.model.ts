import { GamePackageModel } from '../game/package/package.model';
import { LinkedKeyModel } from '../linked-key/linked-key.model';
import { MicrotransactionProductModel } from '../microtransaction/product.model';
import { storeModel } from '../model/model-store.service';
import { Model } from '../model/model.service';
import { SellablePricingModel } from './pricing/pricing.model';

export const enum SellableType {
	Free = 'free',
	Paid = 'paid',
	Pwyw = 'pwyw',
}

export class SellableModel extends Model {
	declare type: SellableType;
	declare primary: boolean;
	declare key: string;
	declare title: string;
	declare description: string;
	declare is_owned?: boolean;
	pricings: SellablePricingModel[] = [];
	linked_key_providers: string[] = [];

	declare resource_type: string | null;
	declare resource_model: GamePackageModel | MicrotransactionProductModel | null;

	// keys settings
	declare linked_keys?: LinkedKeyModel[];

	constructor(data: any = {}) {
		super(data);

		if (data.pricings) {
			this.pricings = SellablePricingModel.populate(data.pricings);
		}

		if (data.linked_keys) {
			this.linked_keys = LinkedKeyModel.populate(data.linked_keys);
		}

		if (data.linked_key_providers) {
			// Just an array of strings.
			this.linked_key_providers = data.linked_key_providers || [];
		}

		if (data.resource && data.resource_type) {
			switch (data.resource_type) {
				case 'Game_Package':
					this.resource_model = new GamePackageModel(data.resource);
					break;
				case 'Microtransaction_Product':
					this.resource_model = storeModel(MicrotransactionProductModel, data.resource);
					break;
			}
		}
	}
}
