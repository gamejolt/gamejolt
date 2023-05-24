import { defineAsyncComponent } from 'vue';
import { CurrencyCostData } from '../../../../../_common/currency/currency-type';
import { InventoryShopProductSale } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import { showModal } from '../../../../../_common/modal/modal.service';

interface ShopProductPurchaseOptions {
	shopProduct: InventoryShopProductSale;
	currencyOptions: CurrencyCostData;
}

export async function showPurchaseShopProductModal(options: ShopProductPurchaseOptions) {
	return await showModal<void>({
		modalId: 'PurchaseShopProduct',
		component: defineAsyncComponent(() => import('./AppPurchaseShopProductModal.vue')),
		props: options,
		size: 'sm',
	});
}
