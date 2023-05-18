<script lang="ts">
import { computed, PropType, Ref, ref, toRefs } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppCurrencyImg from '../../../../../_common/currency/AppCurrencyImg.vue';
import {
	canAffordCurrency,
	Currency,
	CurrencyCostData,
	CurrencyType,
} from '../../../../../_common/currency/currency-type';
import { formatNumber } from '../../../../../_common/filters/number';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import { InventoryShopProductSale } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import AppLinkHelpDocs from '../../../../../_common/link/AppLinkHelpDocs.vue';
import { showPurchaseMicrotransactionModal } from '../../../../../_common/microtransaction/purchase-modal/modal.service';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import AppStickerPack, {
	StickerPackRatio,
} from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackOpenModal } from '../../../../../_common/sticker/pack/open-modal/modal.service';
import { UserStickerPack } from '../../../../../_common/sticker/pack/user-pack.model';
import { useStickerStore } from '../../../../../_common/sticker/sticker-store';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettextInterpolate } from '../../../../../_common/translate/translate.service';
import { styleFlexCenter, styleMaxWidthForOptions } from '../../../../../_styles/mixins';

interface PurchaseData {
	shopProduct: InventoryShopProductSale;
	currency: Currency;
	balanceRefs: {
		coinBalance: Ref<number>;
		joltbuxBalance: Ref<number>;
	};
}

interface PurchaseDataCallbacks {
	beforeRequest?: () => void;
	onItemPurchased?: { pack?: (item: UserStickerPack) => void };
}

export async function purchaseShopProduct({
	shopProduct,
	currency,
	balanceRefs,
	beforeRequest,
	onItemPurchased,
}: PurchaseData & PurchaseDataCallbacks) {
	const { coinBalance, joltbuxBalance } = balanceRefs;
	const pricing = shopProduct.validPricings.find(i => i.knownCurrencyType?.id === currency.id);

	if (!pricing || !canAffordCurrency(currency, pricing.price, balanceRefs)) {
		showErrorGrowl(
			$gettextInterpolate(`You don't have enough %{ label } to purchase this product.`, {
				label: currency.label,
			})
		);
		return;
	}

	if (beforeRequest) {
		beforeRequest();
	}

	try {
		const response = await Api.sendRequest(
			`/web/inventory/shop/purchase/${pricing.id}`,
			{},
			{ detach: true }
		);

		if (response.success === false) {
			throw 'Failed to purchase product';
		}

		const rawProduct = response.product;
		if (!rawProduct) {
			throw 'Product returned from backend is empty';
		}

		const newBalance = response.new_balance;
		if (typeof newBalance === 'number') {
			let balance: Ref<number> | undefined = undefined;

			switch (pricing.knownCurrencyType?.id) {
				case CurrencyType.coins.id:
					balance = coinBalance;
					break;
				case CurrencyType.joltbux.id:
					balance = joltbuxBalance;
					break;
			}

			if (balance) {
				balance.value = Math.max(0, newBalance);
			}
		}

		if (shopProduct.stickerPack) {
			const pack = new UserStickerPack(rawProduct);
			if (pack == null) {
				throw 'No sticker pack found after purchasing product';
			}
			onItemPurchased?.pack?.(pack);
		} else {
			// TODO(mtx-checkout) logging
			console.error('No product model found after purchasing product', {
				currency_type: pricing.knownCurrencyType,
				pricing_id: pricing.id,
				product_id: shopProduct.id,
			});
		}
	} catch (e) {
		// TODO(mtx-checkout) logging
		console.error('Error purchasing product', {
			currency_type: pricing.knownCurrencyType,
			pricing_id: pricing.id,
			product_id: shopProduct.id,
		});
	}
}
</script>

<script lang="ts" setup>
const props = defineProps({
	shopProduct: {
		type: Object as PropType<InventoryShopProductSale>,
		required: true,
	},
	currencyOptions: {
		type: Object as PropType<CurrencyCostData>,
		required: true,
	},
});

const { shopProduct, currencyOptions } = toRefs(props);

const modal = useModal()!;

const { stickerPacks } = useStickerStore();
const { coinBalance, joltbuxBalance } = useCommonStore();

const balanceRefs = { coinBalance, joltbuxBalance };

const processingPurchaseCurrencyId = ref<string>();

const currencyOptionsList = computed(() => Object.entries(currencyOptions.value));

const joltbuxEntry = computed(() => {
	for (const [id, data] of currencyOptionsList.value) {
		if (id === CurrencyType.joltbux.id) {
			return data;
		}
	}
});

/**
 * Show when we have a Joltbux purchase option and the user doesn't have enough
 * Joltbux to purchase.
 */
const showPurchaseJoltbuxButton = computed(() => {
	const currency = joltbuxEntry.value?.currency;
	const amount = joltbuxEntry.value?.amount;
	if (!currency || amount === undefined) {
		return false;
	}
	return !canAffordCurrency(currency, amount, balanceRefs);
});

/**
 * Show when we have a Joltbux purchase option and the product is a sticker
 * pack.
 */
const showPackHelpDocsLink = computed(
	() => !!joltbuxEntry.value && !!shopProduct.value.stickerPack
);

/**
 * Purchases an inventory shop product using the specified Currency.
 */
async function purchaseProduct(options: PurchaseData) {
	if (processingPurchaseCurrencyId.value) {
		return;
	}
	processingPurchaseCurrencyId.value = options.currency.id;

	await purchaseShopProduct({
		...options,
		onItemPurchased: {
			pack(item) {
				handleStickerPackPurchase(item);
				modal.dismiss();
			},
		},
	});

	processingPurchaseCurrencyId.value = undefined;
}

function handleStickerPackPurchase(product: UserStickerPack) {
	if (!(product instanceof UserStickerPack)) {
		return;
	}

	if (stickerPacks.value.some(i => i.id === product.id)) {
		// Was probably handled somewhere already, ignore.
		return;
	}
	stickerPacks.value.push(product);

	// Show the PackOpen modal. This should ask them if they want to open right
	// away or save their pack for later.
	StickerPackOpenModal.show({
		pack: product,
		openImmediate: false,
	});
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-body">
			<div :style="styleFlexCenter({ direction: 'column' })">
				<template v-if="shopProduct.stickerPack">
					<AppStickerPack
						:style="{
							...styleMaxWidthForOptions({
								ratio: StickerPackRatio,
								maxWidth: 160,
								maxHeight: Screen.height / 4,
							}),
							width: `100%`,
						}"
						:pack="shopProduct.stickerPack"
						:show-details="{
							name: true,
						}"
					/>
					<AppSpacer vertical :scale="4" />
				</template>

				<template v-if="currencyOptionsList.length !== 1">
					<div class="text-center">
						{{
							!currencyOptionsList.length
								? $gettext(`This item is not available for purchase`)
								: $gettext(`Choose a purchase option`)
						}}
					</div>
					<AppSpacer vertical :scale="3" />
				</template>

				<div
					:style="{
						...styleFlexCenter(),
						width: `100%`,
						gap: `12px`,
					}"
				>
					<AppButton
						v-for="[id, { currency, amount }] in currencyOptionsList"
						:key="id"
						:disabled="
							!!processingPurchaseCurrencyId ||
							!canAffordCurrency(currency, amount, balanceRefs)
						"
						:defined-slots="['icon']"
						solid
						block
						@click="() => purchaseProduct({ shopProduct, currency, balanceRefs })"
					>
						<template #icon="{ size }">
							<AppCurrencyImg
								:currency="currency"
								asset-size="small"
								:max-width="size"
							/>
						</template>

						{{ formatNumber(amount) }}
					</AppButton>
				</div>

				<template v-if="showPurchaseJoltbuxButton">
					<AppSpacer vertical :scale="3" />

					<AppButton primary trans block @click="showPurchaseMicrotransactionModal()">
						{{ $gettext(`Get Joltbux`) }}
					</AppButton>
				</template>

				<template v-if="showPackHelpDocsLink">
					<AppSpacer vertical :scale="3" />

					<div class="text-center">
						<AppLinkHelpDocs category="drop-rates">
							{{ $gettext(`Learn more about packs`) }}
						</AppLinkHelpDocs>
					</div>
				</template>
			</div>
		</div>
	</AppModal>
</template>
