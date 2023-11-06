import { AvatarFrameModel } from '../../avatar/frame.model';
import { BackgroundModel } from '../../background/background.model';
import { CurrencyCostData } from '../../currency/currency-type';
import { ModelStoreModel, storeModel, storeModelList } from '../../model/model-store.service';
import { StickerPackModel } from '../../sticker/pack/pack.model';
import { InventoryShopProductSalePricingModel } from './inventory-shop-product-sale-pricing.model';

interface ModelWithName extends ModelStoreModel {
	name?: string;
}

export class InventoryShopProductSaleModel implements ModelStoreModel {
	declare id: number;
	declare product_type: string;
	declare product?: ModelWithName;
	declare pricings: InventoryShopProductSalePricingModel[];
	declare starts_on?: number;
	declare ends_on?: number;
	declare can_purchase: boolean;
	declare is_product_owned: boolean;

	update(data: any) {
		Object.assign(this, data);

		// TODO(collectible-sales): remove debug code
		if (import.meta.env.DEV) {
			if (data.can_purchase === undefined) {
				this.can_purchase = this.id % 2 === 0 || data.product_type === 'Background';
			}
			if (data.is_product_owned === undefined) {
				this.is_product_owned = this.id % 2 !== 0 || data.product_type === 'Background';
			}
		}

		if (data.pricings) {
			this.pricings = storeModelList(InventoryShopProductSalePricingModel, data.pricings);
		}

		if (data.product) {
			switch (data.product_type) {
				case 'Sticker_Pack':
					this.product = storeModel(StickerPackModel, data.product);
					break;

				case 'Avatar_Frame':
					this.product = storeModel(AvatarFrameModel, data.product);
					break;

				case 'Background':
					this.product = storeModel(BackgroundModel, data.product);
					break;

				default:
					console.warn('Unsupported product type', data.product_type);
					break;
			}
		}
	}

	get stickerPack() {
		if (this.product instanceof StickerPackModel) {
			return this.product;
		}
		return null;
	}

	get avatarFrame() {
		if (this.product instanceof AvatarFrameModel) {
			return this.product;
		}
		return null;
	}

	get background() {
		if (this.product instanceof BackgroundModel) {
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
