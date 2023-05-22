import { CurrencyCostData } from '../../../_common/currency/currency-type';
import { ModelStoreModel, storeModelList } from '../../../_common/model/model-store.service';
import { Model } from '../../../_common/model/model.service';
import { StickerPack } from '../../../_common/sticker/pack/pack.model';
import { InventoryShopProductSalePricing } from './inventory-shop-product-sale-pricing.model';

export class InventoryShopProductSale implements ModelStoreModel {
	declare id: number;
	declare product_type: string;
	declare product?: Model;
	declare pricings: InventoryShopProductSalePricing[];
	declare starts_on?: number;
	declare ends_on?: number;

	constructor(data: any = {}) {
		this.update(data);
	}

	update(data: any) {
		Object.assign(this, data);

		if (data.pricings) {
			this.pricings = storeModelList(InventoryShopProductSalePricing, data.pricings);
		}

		if (data.product) {
			switch (data.product_type) {
				case 'Sticker_Pack':
					this.product = new StickerPack(data.product);
					break;

				default:
					console.warn('Unsupported product type', data.product_type);
					break;
			}
		}
	}

	get stickerPack() {
		if (this.product instanceof StickerPack) {
			return this.product;
		}
	}

	get validPricings() {
		return this.pricings.filter(i => i.isValid);
	}

	get validPricingsData() {
		const result: CurrencyCostData = {};
		for (const pricing of this.validPricings) {
			const currency = pricing.knownCurrencyType;
			if (!currency) {
				continue;
			}

			result[currency.id] = [currency, pricing.price];
		}
		return result;
	}
}
