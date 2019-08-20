import { LinkedKey } from '../linked-key/linked-key.model';
import { Model } from '../model/model.service';
import { SellablePricing } from './pricing/pricing.model';

export class Sellable extends Model {
	static readonly TYPE_FREE = 'free';
	static readonly TYPE_PAID = 'paid';
	static readonly TYPE_PWYW = 'pwyw';

	type!: 'free' | 'paid' | 'pwyw';
	primary!: boolean;
	key!: string;
	title!: string;
	description!: string;
	pricings: SellablePricing[] = [];
	is_owned?: boolean;
	linked_key_providers: string[] = [];

	// keys settings
	linked_keys?: LinkedKey[];

	game_package_id?: number;

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
	}
}

Model.create(Sellable);
