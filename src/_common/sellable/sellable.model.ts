import { GamePackage } from '../game/package/package.model';
import { LinkedKey } from '../linked-key/linked-key.model';
import { MicrotransactionProduct } from '../microtransaction/product.model';
import { storeModel } from '../model/model-store.service';
import { Model, defineLegacyModel } from '../model/model.service';
import { SellablePricing } from './pricing/pricing.model';

export const enum SellableType {
	Free = 'free',
	Paid = 'paid',
	Pwyw = 'pwyw',
}

export class Sellable extends defineLegacyModel(
	class SellableDefinition extends Model {
		declare type: SellableType;
		declare primary: boolean;
		declare key: string;
		declare title: string;
		declare description: string;
		declare is_owned?: boolean;
		pricings: SellablePricing[] = [];
		linked_key_providers: string[] = [];

		declare resource_type: string | null;
		declare resource_model: GamePackage | MicrotransactionProduct | null;

		// keys settings
		declare linked_keys?: LinkedKey[];

		constructor(data: any = {}) {
			super(data);

			if (data.pricings) {
				this.pricings = SellablePricing.populate(data.pricings);
			}

			if (data.linked_keys) {
				this.linked_keys = LinkedKey.populate(data.linked_keys);
			}

			if (data.linked_key_providers) {
				// Just an array of strings.
				this.linked_key_providers = data.linked_key_providers || [];
			}

			if (data.resource && data.resource_type) {
				switch (data.resource_type) {
					case 'Game_Package':
						this.resource_model = new GamePackage(data.resource);
						break;
					case 'Microtransaction_Product':
						this.resource_model = storeModel(MicrotransactionProduct, data.resource);
						break;
				}
			}
		}
	}
) {}
