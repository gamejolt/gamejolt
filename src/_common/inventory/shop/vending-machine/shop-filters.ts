import { CurrencyType } from '~common/currency/currency-type';
import { InventoryShopProductSaleModel } from '~common/inventory/shop/inventory-shop-product-sale.model';

export type ShopFilterCurrency = 'all' | 'joltbux' | 'coins';

export type ShopFilters = {
	currency: ShopFilterCurrency;
	limitedTime: boolean;
	notOwned: boolean;
};

export function createDefaultShopFilters(): ShopFilters {
	return {
		currency: 'all',
		limitedTime: false,
		notOwned: false,
	};
}

export function isDefaultShopFilters({ currency, limitedTime, notOwned }: ShopFilters) {
	return currency === 'all' && !limitedTime && !notOwned;
}

export function saleMatchesShopFilters(
	sale: InventoryShopProductSaleModel,
	{ currency, limitedTime, notOwned }: ShopFilters
) {
	// A sale can be priced in multiple currencies, so it should match any
	// currency it has a valid pricing for.
	if (currency !== 'all' && !sale.validPricingsData[CurrencyType[currency].id]) {
		return false;
	}
	if (limitedTime && !sale.ends_on) {
		return false;
	}
	if (notOwned && sale.is_product_owned) {
		return false;
	}
	return true;
}
