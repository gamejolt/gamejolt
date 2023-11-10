<script lang="ts">
import { PropType, Ref, computed, onUnmounted, ref, toRef, toRefs, watch, watchEffect } from 'vue';
import AppAlertBox from '../../../../../_common/alert/AppAlertBox.vue';
import { Api } from '../../../../../_common/api/api.service';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { vAppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import { DefaultAvatarFrameScale } from '../../../../../_common/avatar/frame.model';
import AppBackgroundFade from '../../../../../_common/background/AppBackgroundFade.vue';
import { BackgroundModel } from '../../../../../_common/background/background.model';
import AppButton from '../../../../../_common/button/AppButton.vue';
import {
	AcquisitionData,
	CollectibleAcquisitionMethod,
	getCollectibleAcquisition,
} from '../../../../../_common/collectible/collectible.model';
import AppCurrencyImg from '../../../../../_common/currency/AppCurrencyImg.vue';
import {
	Currency,
	CurrencyType,
	canAffordCurrency,
} from '../../../../../_common/currency/currency-type';
import { shorthandReadableTime } from '../../../../../_common/filters/duration';
import { formatNumber } from '../../../../../_common/filters/number';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import AppImgResponsive from '../../../../../_common/img/AppImgResponsive.vue';
import { InventoryShopProductSaleModel } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { showPurchaseMicrotransactionModal } from '../../../../../_common/microtransaction/purchase-modal/modal.service';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { storeModel, storeModelList } from '../../../../../_common/model/model-store.service';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackRatio } from '../../../../../_common/sticker/pack/AppStickerPack.vue';
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
import { ProductPurchaseData } from './modal.service';

interface PurchaseData {
	sale: InventoryShopProductSaleModel;
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
	sale,
	currency,
	balanceRefs,
	beforeRequest,
	onItemPurchased,
}: PurchaseData & PurchaseDataCallbacks) {
	const { coinBalance, joltbuxBalance } = balanceRefs;
	const pricing = sale.validPricings.find(i => i.knownCurrencyType?.id === currency.id);

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

		if (sale.stickerPack) {
			item = storeModel(UserStickerPackModel, rawProduct);
			onItemPurchased?.pack?.(item);
		} else if (sale.avatarFrame) {
			item = storeModel(UserAvatarFrameModel, rawProduct);
			onItemPurchased?.avatarFrame?.(item);
		} else if (sale.background) {
			item = storeModel(BackgroundModel, rawProduct);
			onItemPurchased?.background?.(item);
		} else {
			console.error('No product model found after purchasing product', {
				currency_type: pricing.knownCurrencyType,
				pricing_id: pricing.id,
				product_id: sale.id,
			});
		}

		onItemPurchased?.all?.(item);
	} catch (e) {
		console.error('Error purchasing product', {
			currency_type: pricing.knownCurrencyType,
			pricing_id: pricing.id,
			product_id: sale.id,
		});
	}
}
</script>

<script lang="ts" setup>
const props = defineProps({
	productData: {
		type: Object as PropType<ProductPurchaseData>,
		required: true,
	},
	onItemPurchased: {
		type: Function as PropType<() => void>,
		default: undefined,
	},
});

const { productData, onItemPurchased } = toRefs(props);

const modal = useModal()!;
const { stickerPacks } = useStickerStore();
const { user: authUser, coinBalance, joltbuxBalance } = useCommonStore();

const sale = ref<InventoryShopProductSaleModel>();

const acquisitions = ref([]) as Ref<AcquisitionData[]>;
const isLoadingSaleData = ref(false);

const currencyOptions = computed(() => {
	if (!sale.value) {
		return {};
	}
	return sale.value.validPricingsData;
});

// Fetch everything we need to display sale, acquisition, and product data.
//
// TODO(collectible-sales) Should check registry or something to see if we have
// all this loaded in already.
watch(
	productData.value,
	async (product, oldProduct) => {
		const { type: resource, id: resourceId } = product;
		const { type: oldResource, id: oldResourceId } = oldProduct || {};
		if (resource === oldResource && resourceId === oldResourceId) {
			return;
		}
		isLoadingSaleData.value = true;

		try {
			// TODO(collectible-sales) change to single API call to get:
			// - ?sale (if available)
			// - ?product (if found)
			// - acquisitions
			const acquisitionResponse = await Api.sendRequest(
				`/web/inventory/acquisition/${resource}/${resourceId}`,
				undefined,
				{ detach: true }
			);

			acquisitions.value = acquisitionResponse[resource][resourceId] || [];

			const saleAcquisitions = getCollectibleAcquisition(
				acquisitions.value,
				CollectibleAcquisitionMethod.ShopPurchase
			);
			const primarySaleAcquisition = saleAcquisitions.length
				? saleAcquisitions[0]
				: undefined;
			if (!primarySaleAcquisition) {
				sale.value = undefined;
				return;
			}

			const saleResponse = await Api.sendFieldsRequest(
				`/mobile/shop-sale`,
				{
					sales: {
						id: primarySaleAcquisition.data.sale.id,
					},
				},
				{ detach: true }
			);

			const newSales = storeModelList(InventoryShopProductSaleModel, saleResponse.sales);
			const primarySale = newSales.length ? newSales[0] : undefined;
			if (!primarySale) {
				throw new Error('No sale returned for the requested ID');
			}
			if (!primarySale.validProduct) {
				throw new Error(`No supported product found for this sale`);
			}
			sale.value = primarySale;
		} catch (e) {
			console.error('Failed to fetch primary sale through resource/resourceId pair.', e);
			sale.value = undefined;
			acquisitions.value = [];
		} finally {
			isLoadingSaleData.value = false;
		}
	},
	{ immediate: true }
);

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
	const endsOn = sale.value?.ends_on;
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

const actionOptionsData = toRef<() => { text?: string; canPurchase?: boolean }>(() => {
	if (!sale.value) {
		if (isLoadingSaleData.value) {
			return {};
		}
		// TODO(collectible-sales) Would be nice if we could link to the user
		// here. Not really possible with only user-id though, as far as I know.
		if (acquisitions.value.some(i => i.method === CollectibleAcquisitionMethod.ChargeReward)) {
			return {
				text: $gettext(
					`You can obtain this by placing a charged sticker on the creator's content`
				),
				canPurchase: false,
			};
		}
		return {};
	}

	if (sale.value.is_product_owned) {
		// Let them know they already own this if it's not a sticker pack.
		return {
			text: $gettext(`You already own this`),
		};
	}

	const optionsCount = currencyOptionsList.value.length;
	if (!optionsCount) {
		return {
			text: $gettext(`This is not available for purchase`),
		};
	}

	return {
		text: optionsCount !== 1 ? $gettext(`Choose a purchase option`) : undefined,
		canPurchase: true,
	};
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
	() => productData.value.type === 'Sticker_Pack' && !!joltbuxEntry.value
);

const headerData = computed<{ label: string; tooltip?: string }>(() => {
	if (isLoadingSaleData.value) {
		return { label: $gettext(`Loading...`) };
	}

	const hasSale = !!sale.value;
	const { type } = productData.value;

	// TODO(collectible-sales) revisit this
	if (type === 'Sticker_Pack') {
		return {
			label: hasSale ? $gettext(`Purchase sticker pack`) : $gettext(`Sticker pack`),
			tooltip: hasSale
				? $gettext(
						`Sticker packs contain a random set of stickers which you can collect and place on content throughout Game Jolt.`
				  )
				: undefined,
		};
	} else if (type === 'Avatar_Frame') {
		return {
			label: hasSale ? $gettext(`Purchase avatar frame`) : $gettext(`Avatar frame`),
			tooltip: hasSale
				? $gettext(`Equip an avatar frame to make yourself stand out in the community.`)
				: undefined,
		};
	} else if (type === 'Background') {
		return {
			label: hasSale ? $gettext(`Purchase background`) : $gettext(`Background`),
			tooltip: hasSale
				? $gettext(
						`Backgrounds can be added to your posts to make your content stand out in the feeds.`
				  )
				: undefined,
		};
	}
	return { label: $gettext(`Uh oh...`) };
});

const frameOverride = toRef(() => {
	const data = productData.value;
	let scale = DefaultAvatarFrameScale;
	// Was having template issues where it wasn't casting the type correctly, so
	// this toRef is a workaround.
	if (data.type === 'Avatar_Frame' && data.scale !== undefined) {
		scale = data.scale;
	}
	return {
		image_url: data.imgUrl,
		scale,
	};
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
async function purchaseProduct(currency: PurchaseData['currency']) {
	if (processingPurchaseCurrencyId.value || !sale.value) {
		return;
	}
	processingPurchaseCurrencyId.value = currency.id;

	await purchaseShopProduct({
		sale: sale.value,
		currency,
		balanceRefs,
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
			<!-- <div v-if="!sale" :style="styleFlexCenter({ direction: 'column' })">
				<template v-if="isLoadingShopProduct">
					<div :style="getItemWidthStyles(1)">
						<AppAspectRatio :ratio="1" :inner-styles="styleFlexCenter()">
							<AppLoading centered big />
						</AppAspectRatio>
					</div>
				</template>
				<template v-else>
					<AppIllustration :asset="illExtremeSadness">
						{{
							$gettext(
								`It doesn't look like that's for sale. Please try again later.`
							)
						}}
					</AppIllustration>
				</template>
			</div> -->
			<div :style="styleFlexCenter({ direction: 'column' })">
				<div
					:style="
						getItemWidthStyles(
							productData.type === 'Sticker_Pack' ? StickerPackRatio : 1
						)
					"
				>
					<AppUserAvatarBubble
						v-if="productData.type === 'Avatar_Frame'"
						:user="authUser"
						:frame-override="frameOverride"
						show-frame
						smoosh
						disable-link
					/>
					<AppAspectRatio
						v-else
						v-bind="
							productData.type === 'Sticker_Pack'
								? { ratio: StickerPackRatio }
								: {
										ratio: 1,
										style: styleBorderRadiusLg,
								  }
						"
					>
						<AppImgResponsive
							v-if="productData.processMediaserverUrl"
							:style="{
								width: `100%`,
								height: `100%`,
							}"
							:src="productData.imgUrl"
							alt=""
						/>
						<img
							v-else
							:style="{
								width: `100%`,
								height: `100%`,
							}"
							:src="productData.imgUrl"
							alt=""
						/>
						<AppBackgroundFade v-if="productData.type === 'Background'" />
					</AppAspectRatio>
				</div>

				<div
					v-if="productData.name"
					:style="{
						marginTop: `8px`,
						fontWeight: 700,
					}"
				>
					{{ productData.name }}
				</div>

				<AppSpacer vertical :scale="4" />

				<template v-if="timeRemaining">
					<div>
						{{ timeRemaining }}
					</div>

					<AppSpacer vertical :scale="4" />
				</template>

				<div v-if="actionOptionsData.text" :style="{ width: `100%` }">
					<AppAlertBox v-if="!actionOptionsData.canPurchase" icon="info-circle">
						{{ actionOptionsData.text }}
					</AppAlertBox>
					<div v-else class="text-center">
						{{ actionOptionsData.text }}
					</div>

					<AppSpacer vertical :scale="3" />
				</div>

				<div
					v-if="actionOptionsData.canPurchase"
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
							isExpired ||
							!!processingPurchaseCurrencyId ||
							!canAffordCurrency(currency.id, amount, balanceRefs)
						"
						:dynamic-slots="['icon']"
						lg
						solid
						block
						@click="() => purchaseProduct(currency)"
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

				<div v-if="productData.type === 'Sticker_Pack'" :style="{ width: `100%` }">
					<AppSpacer vertical :scale="8" />
					<AppStickerPackContents :pack="productData" />
				</div>
			</div>
		</div>
	</AppModal>
</template>
