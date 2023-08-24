import { AvatarFrame } from '../../avatar/frame.model';
import { Background } from '../../background/background.model';
import { CurrencyCostData } from '../../currency/currency-type';
import { ModelStoreModel, storeModelList } from '../../model/model-store.service';
import { Model } from '../../model/model.service';
import { StickerPack } from '../../sticker/pack/pack.model';
import { InventoryShopProductSalePricing } from './inventory-shop-product-sale-pricing.model';

interface ModelWithName extends Model {
	name?: string;
}

export class InventoryShopProductSale implements ModelStoreModel {
	declare id: number;
	declare product_type: string;
	declare product?: ModelWithName;
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

				case 'Avatar_Frame':
					this.product = new AvatarFrame(data.product);
					break;

				case 'Background':
					this.product = new Background(data.product);
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
		return null;
	}

	get avatarFrame() {
		if (this.product instanceof AvatarFrame) {
			return this.product;
		}
		return null;
	}

	get background() {
		if (this.product instanceof Background) {
			return this.product;
		}
		return null;
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
