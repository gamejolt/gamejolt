import { Ref } from 'vue';
import { trackGiftAction } from '../../analytics/analytics.service';
import { Api } from '../../api/api.service';
import { AvatarFrameModel } from '../../avatar/frame.model';
import { BackgroundModel } from '../../background/background.model';
import { markProductAsUnlocked } from '../../collectible/collectible.model';
import {
	Currency,
	CurrencyCostData,
	CurrencyType,
	canAffordCurrency,
} from '../../currency/currency-type';
import { showErrorGrowl } from '../../growls/growls.service';
import { ModelStoreModel, storeModel, storeModelList } from '../../model/model-store.service';
import { showStickerPackOpenModal } from '../../sticker/pack/open-modal/modal.service';
import { StickerPackModel } from '../../sticker/pack/pack.model';
import { UserStickerPackModel } from '../../sticker/pack/user-pack.model';
import { $gettext } from '../../translate/translate.service';
import { UserAvatarFrameModel } from '../../user/user-avatar/frame/frame.model';
import type { UserModel } from '../../user/user.model';
import { InventoryShopProductSalePricingModel } from './inventory-shop-product-sale-pricing.model';
import { showNewProductModal } from './product-modal/modal.service';
import {
	InventoryShopProduct,
	PurchasableProductType,
	assignShopProductOwnerData,
} from './product-owner-helpers';

export class InventoryShopProductSaleModel implements ModelStoreModel {
	declare id: number;
	declare product_type: PurchasableProductType;
	declare product?: InventoryShopProduct;
	declare pricings: InventoryShopProductSalePricingModel[];
	declare starts_on?: number;
	declare ends_on?: number;
	declare is_product_owned: boolean;

	update(data: any) {
		Object.assign(this, data);

		if (data.pricings) {
			this.pricings = storeModelList(InventoryShopProductSalePricingModel, data.pricings);
		}

		assignShopProductOwnerData(this, data);
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

	get validProduct() {
		return this.stickerPack || this.avatarFrame || this.background;
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

export interface BalanceRefs {
	coinBalance: Ref<number>;
	joltbuxBalance: Ref<number>;
}

interface PurchaseData {
	sale: InventoryShopProductSaleModel;
	currency: Currency;
	balanceRefs: BalanceRefs;
	stickerPacks: Ref<UserStickerPackModel[]>;
	beforeRequest?: () => void;
	onSuccess?: () => void;
	giftTo?: UserModel;
}

function _validateCurrency({ sale, currency, balanceRefs }: PurchaseData) {
	const pricing = sale.validPricings.find(i => i.knownCurrencyType?.id === currency.id);

	if (!pricing || !canAffordCurrency(currency.id, pricing.price, balanceRefs)) {
		return null;
	}
	return pricing;
}

/**
 * Purchases a shop product without asking for confirmation.
 */
export async function purchaseShopProduct(data: PurchaseData) {
	const { sale, currency, stickerPacks, balanceRefs, beforeRequest, onSuccess, giftTo } = data;

	const pricing = _validateCurrency(data);
	if (!pricing) {
		showErrorGrowl(
			$gettext(`You don't have enough %{ label } to purchase this product.`, {
				label: currency.label,
			})
		);
		return;
	}

	if (beforeRequest) {
		beforeRequest();
	}

	if (giftTo) {
		trackGiftAction({
			action: 'send',
			currency: currency,
			userId: giftTo.id,
			saleId: sale.id,
		});
	}

	try {
		const body = {} as any;
		if (giftTo) {
			body.target_resource_id = giftTo.id;
		}

		const response = await Api.sendRequest(`/web/inventory/shop/purchase/${pricing.id}`, body, {
			detach: true,
		});

		if (response.success === false) {
			throw new Error(`Failed to purchase product`);
		}

		const currencyData: CurrencyData = {
			newBalance: response.new_balance,
			currency,
		};

		if (giftTo) {
			// Gifting only cares about updating the balance.
			processNewCurrencyBalance({ currencyData, balanceRefs });
			onSuccess?.();
		} else {
			// Purchasing for self should do additional processing to get the
			// product, display it, etc.
			handleProductReceipt({
				balanceRefs,
				productType: sale.product_type,
				rawProduct: response.product,
				stickerPacks,
				currencyData,
				onSuccess,
			});
		}
	} catch (e) {
		console.error('Error purchasing product', {
			currencyType: pricing.knownCurrencyType,
			pricingId: pricing.id,
			saleId: sale.id,
		});
		showErrorGrowl(
			$gettext(
				`Something went wrong while purchasing this item. Please try again in a few minutes.`
			)
		);
	}
}

interface CurrencyData {
	newBalance: unknown;
	currency: Currency;
}

function processNewCurrencyBalance({
	currencyData: { newBalance, currency },
	balanceRefs,
}: {
	currencyData: CurrencyData;
	balanceRefs: BalanceRefs;
}) {
	if (typeof newBalance === 'number') {
		switch (currency) {
			case CurrencyType.coins:
				balanceRefs.coinBalance.value = Math.max(0, newBalance);
				break;
			case CurrencyType.joltbux:
				balanceRefs.joltbuxBalance.value = Math.max(0, newBalance);
				break;
		}
	}
}

export async function handleProductReceipt({
	rawProduct,
	productType,
	balanceRefs,
	stickerPacks,
	currencyData,
	onSuccess,
}: {
	rawProduct: Record<string, any>;
	productType: string;
	balanceRefs?: BalanceRefs;
	stickerPacks?: Ref<UserStickerPackModel[]>;
	currencyData?: CurrencyData;
	onSuccess?: () => void;
}) {
	if (!rawProduct.id) {
		throw Error('Product returned from backend is empty');
	}

	if (onSuccess) {
		onSuccess();
	}

	if (currencyData && balanceRefs) {
		processNewCurrencyBalance({
			currencyData,
			balanceRefs,
		});
	}

	let item: UserStickerPackModel | UserAvatarFrameModel | BackgroundModel | null = null;

	switch (productType) {
		case 'User_StickerPack':
		case 'Sticker_Pack': {
			item = storeModel(UserStickerPackModel, rawProduct);
			stickerPacks?.value.push(item);

			// Show the PackOpen modal. This should ask them if they want to open
			// right away or save their pack for later.
			await showStickerPackOpenModal({
				pack: item,
			});
			break;
		}

		case 'User_AvatarFrame':
		case 'Avatar_Frame':
			item = storeModel(UserAvatarFrameModel, rawProduct);
			await showNewProductModal({
				product: item,
			});
			break;

		case 'Background':
			item = storeModel(BackgroundModel, rawProduct);
			await showNewProductModal({
				product: item,
			});
			break;

		default:
			console.error('No product model found after purchasing product');
			return;
	}

	markProductAsUnlocked(item);
}
