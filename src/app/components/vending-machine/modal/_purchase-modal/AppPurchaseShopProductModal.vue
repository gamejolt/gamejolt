<script lang="ts">
import { PropType, Ref, computed, onUnmounted, ref, toRef, toRefs, watchEffect } from 'vue';
import AppAlertBox from '../../../../../_common/alert/AppAlertBox.vue';
import { Api } from '../../../../../_common/api/api.service';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { vAppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import AppBackground from '../../../../../_common/background/AppBackground.vue';
import { BackgroundModel } from '../../../../../_common/background/background.model';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppCurrencyImg from '../../../../../_common/currency/AppCurrencyImg.vue';
import {
	Currency,
	CurrencyCostData,
	CurrencyType,
	canAffordCurrency,
} from '../../../../../_common/currency/currency-type';
import { shorthandReadableTime } from '../../../../../_common/filters/duration';
import { formatNumber } from '../../../../../_common/filters/number';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import { InventoryShopProductSaleModel } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { showPurchaseMicrotransactionModal } from '../../../../../_common/microtransaction/purchase-modal/modal.service';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { storeModel } from '../../../../../_common/model/model-store.service';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import AppStickerPack, {
	StickerPackRatio,
} from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import AppStickerPackContents from '../../../../../_common/sticker/pack/AppStickerPackContents.vue';
import { showStickerPackOpenModal } from '../../../../../_common/sticker/pack/open-modal/modal.service';
import { UserStickerPackModel } from '../../../../../_common/sticker/pack/user-pack.model';
import { useStickerStore } from '../../../../../_common/sticker/sticker-store';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { kThemeFgMuted } from '../../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserAvatarFrameModel } from '../../../../../_common/user/user-avatar/frame/frame.model';
import {
	styleBorderRadiusLg,
	styleFlexCenter,
	styleMaxWidthForOptions,
} from '../../../../../_styles/mixins';
import { getCurrentServerTime } from '../../../../../utils/server-time';
import { routeLandingHelpRedirect } from '../../../../views/landing/help/help.route';
import { showNewProductModal } from '../_product/modal/modal.service';

interface PurchaseData {
	shopProduct: InventoryShopProductSaleModel;
	currency: Currency;
	balanceRefs: {
		coinBalance: Ref<number>;
		joltbuxBalance: Ref<number>;
	};
}

interface PurchaseDataCallbacks {
	beforeRequest?: () => void;
	onItemPurchased?: {
		pack?: (product: UserStickerPackModel) => void;
		avatarFrame?: (product: UserAvatarFrameModel) => void;
		background?: (product: BackgroundModel) => void;
		all?: (
			product: UserStickerPackModel | UserAvatarFrameModel | BackgroundModel | null
		) => void;
	};
}

/**
 * Purchases a shop product without asking for confirmation.
 */
export async function purchaseShopProduct({
	shopProduct,
	currency,
	balanceRefs,
	beforeRequest,
	onItemPurchased,
}: PurchaseData & PurchaseDataCallbacks) {
	const { coinBalance, joltbuxBalance } = balanceRefs;
	const pricing = shopProduct.validPricings.find(i => i.knownCurrencyType?.id === currency.id);

	if (!pricing || !canAffordCurrency(currency.id, pricing.price, balanceRefs)) {
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

	try {
		const response = await Api.sendRequest(
			`/web/inventory/shop/purchase/${pricing.id}`,
			{},
			{ detach: true }
		);

		if (response.success === false) {
			throw new Error(`Failed to purchase product`);
		}

		const rawProduct = response.product;
		if (!rawProduct) {
			throw new Error(`Product returned from backend is empty`);
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

		let item: UserStickerPackModel | UserAvatarFrameModel | BackgroundModel | null = null;

		if (shopProduct.stickerPack) {
			item = storeModel(UserStickerPackModel, rawProduct);
			onItemPurchased?.pack?.(item);
		} else if (shopProduct.avatarFrame) {
			item = storeModel(UserAvatarFrameModel, rawProduct);
			onItemPurchased?.avatarFrame?.(item);
		} else if (shopProduct.background) {
			item = storeModel(BackgroundModel, rawProduct);
			onItemPurchased?.background?.(item);
		} else {
			console.error('No product model found after purchasing product', {
				currency_type: pricing.knownCurrencyType,
				pricing_id: pricing.id,
				product_id: shopProduct.id,
			});
		}

		onItemPurchased?.all?.(item);
	} catch (e) {
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
		type: Object as PropType<InventoryShopProductSaleModel>,
		required: true,
	},
	currencyOptions: {
		type: Object as PropType<CurrencyCostData>,
		required: true,
	},
	onItemPurchased: {
		type: Function as PropType<() => void>,
		default: undefined,
	},
});

const { shopProduct, currencyOptions, onItemPurchased } = toRefs(props);

const modal = useModal()!;
const { stickerPacks } = useStickerStore();
const { user: authUser, coinBalance, joltbuxBalance } = useCommonStore();

const balanceRefs = { coinBalance, joltbuxBalance };

const processingPurchaseCurrencyId = ref<string>();

let timerBuilder: NodeJS.Timer | null = null;
const timeRemaining = ref<string>();

const isExpired = ref(false);

function clearTimerBuilder() {
	if (timerBuilder) {
		clearInterval(timerBuilder);
		timerBuilder = null;
	}
}

/**
 * Updates the {@link timeRemaining} text and {@link isExpired} state, and
 * clears the timer once we've hit an expired state.
 */
function checkTimeRemaining(endsOn: number) {
	if (endsOn - getCurrentServerTime() < 1_000) {
		clearTimerBuilder();
		timeRemaining.value = $gettext(`No longer for sale.`);
		isExpired.value = true;
		return;
	}

	timeRemaining.value = $gettext(`Limited time to purchase: %{ time }`, {
		time: shorthandReadableTime(endsOn, {
			nowText: '0s',
			precision: 'exact',
			allowFuture: true,
		}),
	});
}

watchEffect(() => {
	const endsOn = shopProduct.value.ends_on;
	// Not sure if endsOn is different due to a prop changing, so we should just
	// always clear the timer builder and set up fresh again as required.
	clearTimerBuilder();

	if (endsOn) {
		timerBuilder = setInterval(() => checkTimeRemaining(endsOn), 1_000);
		checkTimeRemaining(endsOn);
		return;
	}

	timeRemaining.value = undefined;
	isExpired.value = false;
});

const purchaseOptionsHeaderText = toRef<
	() => { text: string; hidePurchaseOptions?: boolean } | null
>(() => {
	// TODO(collectible-sales) revisit this
	if (!shopProduct.value.can_purchase) {
		// Let them know they already own this if it's not a sticker pack.
		return {
			text:
				shopProduct.value.is_product_owned && !shopProduct.value.stickerPack
					? $gettext(`You already own this item`)
					: $gettext(`You're unable to purchase this`),
			hidePurchaseOptions: true,
		};
	}

	const optionsCount = currencyOptionsList.value.length;
	if (!optionsCount) {
		return {
			text: $gettext(`This item is not available for purchase`),
			hidePurchaseOptions: true,
		};
	} else if (optionsCount !== 1) {
		return { text: $gettext(`Choose a purchase option`) };
	}
	return null;
});

const currencyOptionsList = computed(() => Object.entries(currencyOptions.value));

const joltbuxEntry = computed(() => {
	for (const [id, data] of currencyOptionsList.value) {
		if (id === CurrencyType.joltbux.id) {
			return data;
		}
	}
});

const canPurchaseAny = computed(() => {
	const options = currencyOptionsList.value;
	if (options.length === 0) {
		return false;
	}
	for (const [, [currency, amount]] of currencyOptionsList.value) {
		if (canAffordCurrency(currency.id, amount, balanceRefs)) {
			return true;
		}
	}
});

/**
 * Show when we have a Joltbux purchase option and the user doesn't have enough
 * Joltbux to purchase.
 */
const showPurchaseJoltbuxButton = computed(() => {
	if (!joltbuxEntry.value) {
		return false;
	}

	const [currency, amount] = joltbuxEntry.value;
	return !canAffordCurrency(currency.id, amount, balanceRefs);
});

/**
 * Show when we have a Joltbux purchase option and the product is a sticker
 * pack.
 */
const showPackHelpDocsLink = computed(
	() => !!joltbuxEntry.value && !!shopProduct.value.stickerPack
);

const headerData = computed<{ label: string; tooltip?: string }>(() => {
	if (shopProduct.value.stickerPack) {
		return {
			label: $gettext(`Purchase sticker pack`),
			tooltip: $gettext(
				`Sticker packs contain a random set of stickers which you can collect and place on content throughout Game Jolt.`
			),
		};
	} else if (shopProduct.value.avatarFrame) {
		return {
			label: $gettext(`Purchase avatar frame`),
			tooltip: $gettext(`Equip an avatar frame to make yourself stand out in the community.`),
		};
	} else if (shopProduct.value.background) {
		return {
			label: $gettext(`Purchase background`),
			tooltip: $gettext(
				`Backgrounds can be added to your posts to make your content stand out in the feeds.`
			),
		};
	}
	return { label: $gettext(`Purchase item`) };
});

onUnmounted(() => {
	if (timerBuilder) {
		clearInterval(timerBuilder);
		timerBuilder = null;
	}
});

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
			pack(product) {
				handleStickerPackPurchase(product);
			},
			avatarFrame(product) {
				showNewProductModal({ product });
			},
			background(product) {
				showNewProductModal({ product });
			},
			all() {
				modal.dismiss();
				onItemPurchased?.value?.();
			},
		},
	});

	processingPurchaseCurrencyId.value = undefined;
}

function handleStickerPackPurchase(product: UserStickerPackModel) {
	if (stickerPacks.value.some(i => i.id === product.id)) {
		// Was probably handled somewhere already, ignore.
		return;
	}
	stickerPacks.value.push(product);

	// Show the PackOpen modal. This should ask them if they want to open right
	// away or save their pack for later.
	showStickerPackOpenModal({
		pack: product,
		openImmediate: false,
	});
}

function onClickGetJoltbux() {
	// vAppAuthRequired didn't seem to prevent the onClick directly on the
	// button, so check here before showing the modal.
	if (!authUser.value) {
		return;
	}
	showPurchaseMicrotransactionModal();
}

function getItemWidthStyles(ratio: number) {
	return {
		...styleMaxWidthForOptions({
			ratio,
			maxWidth: 320,
			maxHeight: Screen.height / 3,
		}),
		width: `100%`,
	};
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h2
				class="modal-title"
				:style="{
					display: `flex`,
					alignItems: `center`,
					gap: `12px`,
				}"
			>
				{{ headerData.label }}

				<AppJolticon
					v-if="headerData.tooltip"
					v-app-tooltip.touchable="headerData.tooltip"
					icon="help-circle"
					:style="{
						margin: 0,
						color: kThemeFgMuted,
						fontSize: `inherit`,
					}"
				/>
			</h2>
		</div>

		<div class="modal-body">
			<div :style="styleFlexCenter({ direction: 'column' })">
				<AppStickerPack
					v-if="shopProduct.stickerPack"
					:style="getItemWidthStyles(StickerPackRatio)"
					:pack="shopProduct.stickerPack"
					:show-details="{
						name: true,
					}"
				/>
				<div v-else-if="shopProduct.product" :style="getItemWidthStyles(1)">
					<AppUserAvatarBubble
						v-if="shopProduct.avatarFrame"
						:user="authUser"
						:frame-override="shopProduct.avatarFrame"
						show-frame
						smoosh
						disable-link
					/>
					<AppBackground
						v-else-if="shopProduct.background"
						:background="shopProduct.background"
						:backdrop-style="styleBorderRadiusLg"
						:background-style="{
							backgroundSize: `cover`,
							backgroundPosition: `center`,
						}"
						darken
					>
						<AppAspectRatio :ratio="1" />
					</AppBackground>

					<div
						v-if="shopProduct.product.name"
						:style="{
							marginTop: `8px`,
							fontWeight: 700,
						}"
					>
						{{ shopProduct.product.name }}
					</div>
				</div>

				<AppSpacer vertical :scale="4" />

				<template v-if="timeRemaining">
					<div>
						{{ timeRemaining }}
					</div>

					<AppSpacer vertical :scale="4" />
				</template>

				<div v-if="purchaseOptionsHeaderText" :style="{ width: `100%` }">
					<AppAlertBox
						v-if="purchaseOptionsHeaderText.hidePurchaseOptions"
						icon="info-circle"
					>
						{{ purchaseOptionsHeaderText.text }}
					</AppAlertBox>
					<div v-else class="text-center">
						{{ purchaseOptionsHeaderText.text }}
					</div>

					<AppSpacer vertical :scale="3" />
				</div>

				<div
					v-if="
						!purchaseOptionsHeaderText || !purchaseOptionsHeaderText.hidePurchaseOptions
					"
					:style="{
						...styleFlexCenter(),
						width: `100%`,
						gap: `12px`,
					}"
				>
					<AppButton
						v-for="[id, [currency, amount]] in currencyOptionsList"
						:key="id"
						:style="{
							// Remove automatic margin from adjacent <button> elements.
							margin: 0,
						}"
						:disabled="
							!shopProduct.can_purchase ||
							isExpired ||
							!!processingPurchaseCurrencyId ||
							!canAffordCurrency(currency.id, amount, balanceRefs)
						"
						:dynamic-slots="['icon']"
						lg
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

				<template v-if="!canPurchaseAny && currencyOptionsList.length == 1 && joltbuxEntry">
					<AppSpacer vertical :scale="6" />

					<div class="text-center">
						{{ $gettext(`You can purchase this item with Joltbux`) }}
					</div>
				</template>

				<template v-if="showPurchaseJoltbuxButton">
					<AppSpacer vertical :scale="3" />

					<AppButton v-app-auth-required primary trans block @click="onClickGetJoltbux()">
						{{ $gettext(`Get Joltbux`) }}
					</AppButton>
				</template>

				<template v-if="showPackHelpDocsLink">
					<AppSpacer vertical :scale="6" />

					<div class="text-center">
						<RouterLink
							class="link-muted"
							:to="{
								name: routeLandingHelpRedirect.name,
								params: {
									path: 'drop-rates',
								},
							}"
						>
							{{ $gettext(`Learn more about packs`) }}
						</RouterLink>
					</div>
				</template>

				<div v-if="shopProduct.stickerPack" :style="{ width: `100%` }">
					<AppSpacer vertical :scale="8" />
					<AppStickerPackContents :pack="shopProduct.stickerPack" />
				</div>
			</div>
		</div>
	</AppModal>
</template>
