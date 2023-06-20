import { getCurrencyTypeFromIdentifier } from '../../../_common/currency/currency-type';
import { ModelStoreModel } from '../../../_common/model/model-store.service';

export class InventoryShopProductSalePricing implements ModelStoreModel {
	declare id: number;
	declare currency_identifier: string;
	declare price: number;

	constructor(data: any = {}) {
		this.update(data);
	}

	update(data: any) {
		Object.assign(this, data);
	}

	get knownCurrencyType() {
		return getCurrencyTypeFromIdentifier(this.currency_identifier);
	}

	get isValid() {
		return this.knownCurrencyType !== null;
	}
}
