<script lang="ts" setup>
import { CSSProperties, Ref, computed, onMounted, ref, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCurrencyImg from '../../../../_common/currency/AppCurrencyImg.vue';
import AppCurrencyPillList from '../../../../_common/currency/AppCurrencyPillList.vue';
import { Currency, CurrencyType } from '../../../../_common/currency/currency-type';
import {
	featureMicrotransactions,
	fetchFeatureToggles,
} from '../../../../_common/features/features.service';
import { formatNumber } from '../../../../_common/filters/number';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { illNoCommentsSmall } from '../../../../_common/illustration/illustrations';
import { InventoryShopProductSaleModel } from '../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { showPurchaseMicrotransactionModal } from '../../../../_common/microtransaction/purchase-modal/modal.service';
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../_common/modal/AppModalFloatingHeader.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { storeModelList } from '../../../../_common/model/model-store.service';
import AppOnHover from '../../../../_common/on/AppOnHover.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { StickerPackRatio } from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import {
	kThemeBgActual,
	kThemeBgBackdrop,
	kThemeBgOffset,
	kThemeFg,
	kThemeFg10,
} from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../../../../_common/user/user.model';
import {
	kElevateTransition,
	styleBorderRadiusBase,
	styleBorderRadiusLg,
	styleChangeBg,
	styleElevate,
	styleFlexCenter,
	styleMaxWidthForOptions,
	styleOverlayTextShadow,
	styleTextOverflow,
	styleWhen,
} from '../../../../_styles/mixins';
import {
	kFontFamilyDisplay,
	kFontFamilyHeading,
	kFontSizeH2,
	kStrongEaseOut,
} from '../../../../_styles/variables';
import { showGetCoinsRedirectModal } from './_get-coins-redirect-modal/modal.service';
import AppVendingMachineProduct from './_product/AppVendingMachineProduct.vue';
import { showPurchaseShopProductModal } from './_purchase-modal/modal.service';
import imageVance from './vance.png';

interface ProductChunks {
	packs?: ProductChunk;
	avatarFrames?: ProductChunk;
	backgrounds?: ProductChunk;
}

interface ProductChunk {
	items: InventoryShopProductSaleModel[];
	type: keyof ProductChunks;
}

const props = defineProps({
	userId: {
		type: Number,
		default: undefined,
	},
});

const { userId } = toRefs(props);

const { isDark } = useThemeStore();
const { coinBalance, joltbuxBalance } = useCommonStore();

const modal = useModal()!;

const shopOwner = ref<UserModel>();
const availableProducts = ref({}) as Ref<ProductChunks>;
const isLoading = ref(false);
const productProcessing = ref<number>();

const hasProducts = computed(() => {
	const e = availableProducts.value;

	return (
		(e.packs?.items.length ||
			e.avatarFrames?.items.length ||
			e.backgrounds?.items.length ||
			0) > 0
	);
});

const currencyCardData = computed(() => {
	const result = [{ currency: CurrencyType.coins, amount: coinBalance.value }];
	if (featureMicrotransactions.value) {
		result.unshift({ currency: CurrencyType.joltbux, amount: joltbuxBalance.value });
	}
	return result;
});

async function init() {
	if (isLoading.value) {
		return;
	}
	isLoading.value = true;

	let productUrl = `/web/inventory/shop/sales`;
	if (userId?.value) {
		productUrl += `?userId=${userId.value}`;
	}

	try {
		const p = await Promise.all([
			Api.sendRequest(productUrl, undefined, { detach: true }),
			Api.sendFieldsRequest(
				'/mobile/me',
				{
					coinBalance: true,
					buxBalance: true,
				},
				{ detach: true }
			),
			fetchFeatureToggles([featureMicrotransactions]),
		]);

		const payload = p[0];
		const newProducts = payload.sales
			? storeModelList(InventoryShopProductSaleModel, payload.sales)
			: [];

		const productChunks: ProductChunks = {};
		const missingItems: InventoryShopProductSaleModel[] = [];

		for (const shopProduct of newProducts) {
			let key: keyof ProductChunks | null = null;

			if (shopProduct.stickerPack) {
				key = 'packs';
			} else if (shopProduct.avatarFrame) {
				key = 'avatarFrames';
			} else if (shopProduct.background) {
				key = 'backgrounds';
			}

			if (!key) {
				missingItems.push(shopProduct);
				continue;
			}

			const items = (productChunks[key]?.items || []).concat(shopProduct);
			productChunks[key] = { type: key, items };
		}

		if (missingItems.length > 0) {
			console.warn(`Got some products that we don't support yet.`, {
				missingCount: missingItems.length,
				types: missingItems.reduce((result, i) => {
					result.set(i.product_type, (result.get(i.product_type) || 0) + 1);
					return result;
				}, new Map<string, number>()),
			});
		}

		availableProducts.value = productChunks;
		if (payload.shopOwner) {
			shopOwner.value = payload.shopOwner;
		}

		const mePayload = p[1];
		coinBalance.value = mePayload.coinBalance;
		joltbuxBalance.value = mePayload.buxBalance;
	} catch (e) {
		console.error('Failed to load vending machine data', e);
	}

	isLoading.value = false;
}

onMounted(() => {
	init();
});

async function purchaseProduct(shopProduct: InventoryShopProductSaleModel) {
	if (productProcessing.value) {
		return;
	}
	const currencyOptions = shopProduct.validPricingsData;
	const currencyOptionsList = Object.entries(currencyOptions);
	if (currencyOptionsList.length === 0) {
		showErrorGrowl($gettext(`This item is not available for purchase right now.`));
		return;
	}

	productProcessing.value = shopProduct.id;

	// Show a modal to let the user choose which currency to use.
	await showPurchaseShopProductModal({
		shopProduct,
		currencyOptions,
		onItemPurchased: () => init(),
	});

	productProcessing.value = undefined;
}

async function onClickCurrencyCard(currency: Currency) {
	if (currency.id === CurrencyType.joltbux.id) {
		showPurchaseMicrotransactionModal();
	} else if (currency.id === CurrencyType.coins.id) {
		const isRedirecting = await showGetCoinsRedirectModal();

		if (isRedirecting) {
			modal.dismiss();
		}
	} else {
		console.error('Unknown currency type', currency);
	}
}

function getTooltipText(type: ProductChunk['type']) {
	switch (type) {
		case 'packs':
			return $gettext(
				`Sticker packs contain a random set of stickers which you can collect and place on content throughout Game Jolt.`
			);

		case 'avatarFrames':
			return $gettext(`Equip an avatar frame to make yourself stand out in the community.`);

		case 'backgrounds':
			return $gettext(
				`Backgrounds can be added to your posts to make your content stand out in the feeds.`
			);
	}
}

// Make the vending machine content full-height for phone sizes.
const containerStyles = computed<CSSProperties>(() =>
	styleWhen(Screen.isXs, {
		display: `flex`,
		flexDirection: `column`,
		minHeight: `100vh`,
	})
);

// Make the vending machine content full-height for phone sizes.
const loadingFadeStyles = computed<CSSProperties>(() => {
	return {
		...styleBorderRadiusLg,
		...styleWhen(Screen.isXs, {
			flex: `auto`,
			display: `flex`,
			flexDirection: `column`,
		}),
		minHeight: `calc(min(45vh, 800px))`,
	};
});

const currencyCardImgStyles: CSSProperties = {
	objectFit: `contain`,
	width: `100%`,
	height: `100%`,
};

const shopOwnerNameStyles: CSSProperties = {
	...styleTextOverflow,
	flex: `auto`,
	minWidth: 0,
};

const currencyCardBaseStyles: CSSProperties = {
	...styleBorderRadiusBase,
	...styleElevate(1),
	backgroundColor: kThemeBgOffset,
	padding: `12px`,
	flex: `auto`,
	display: `flex`,
	flexDirection: `column`,
	alignItems: `center`,
	gap: `8px`,
	cursor: `pointer`,
	color: kThemeFg,
};

const currencyCardTransitionStyles: CSSProperties = {
	transition: `background-color 200ms ${kStrongEaseOut}, ${kElevateTransition}`,
};
</script>

<template>
	<AppModal force-theme="dark">
		<div :style="containerStyles">
			<AppModalFloatingHeader
				:dynamic-slots="{
					title: true,
					bottom: false,
				}"
			>
				<template #modal-controls>
					<div
						:style="{
							display: `flex`,
							width: `100%`,
						}"
					>
						<AppCurrencyPillList
							:style="{
								marginTop: `8px`,
							}"
							:currencies="{
								[CurrencyType.joltbux.id]: [CurrencyType.joltbux, joltbuxBalance],
								[CurrencyType.coins.id]: [CurrencyType.coins, coinBalance],
							}"
							direction="row"
							:gap="8"
						/>

						<AppButton
							:style="{
								marginLeft: `auto`,
								alignSelf: `flex-start`,
							}"
							@click="modal.dismiss()"
						>
							{{ $gettext(`Close`) }}
						</AppButton>
					</div>
				</template>

				<template #title>
					<div
						v-if="shopOwner"
						:style="{
							display: `flex`,
							gap: `12px`,
							alignItems: `center`,
						}"
					>
						<AppUserAvatarBubble
							:style="{
								width: `40px`,
								height: `40px`,
								flex: `none`,
							}"
							:user="shopOwner"
							show-frame
						/>

						<div :style="shopOwnerNameStyles">
							{{
								$gettext(`@%{ username }'s Shop`, {
									username: shopOwner.username,
								})
							}}
						</div>
					</div>
				</template>
			</AppModalFloatingHeader>

			<div
				class="modal-body"
				:style="{
					paddingTop: `0`,
					paddingBottom: `0`,
					flex: `auto`,
					display: `flex`,
					flexDirection: `column`,
				}"
			>
				<AppTheme :force-dark="isDark" :force-light="!isDark">
					<AppLoadingFade
						class="fill-offset"
						:style="loadingFadeStyles"
						:content-styles="{
							...loadingFadeStyles,
						}"
						:is-loading="isLoading"
					>
						<div
							:style="{
								display: `flex`,
								padding: `12px`,
								gap: `12px`,
							}"
						>
							<template
								v-for="{ currency, amount } of currencyCardData"
								:key="currency.id"
							>
								<AppOnHover v-slot="{ hoverBinding, hovered }">
									<div
										v-bind="{
											...hoverBinding,
											style: [
												currencyCardBaseStyles,
												styleWhen(hovered, {
													...styleElevate(2),
													backgroundColor: kThemeBgBackdrop,
												}),
												currencyCardTransitionStyles,
											],
										}"
										@click="onClickCurrencyCard(currency)"
									>
										<div
											class="text-center"
											:style="{
												fontFamily: kFontFamilyDisplay,
												fontSize: kFontSizeH2.px,
											}"
										>
											{{ currency.label }}
										</div>

										<div
											:style="{
												...styleMaxWidthForOptions({
													ratio: 1,
													maxWidth: Screen.isXs ? 64 : 128,
													maxHeight: Screen.height * 0.2,
												}),
												width: `100%`,
											}"
										>
											<AppAspectRatio
												:ratio="1"
												:style="{
													backgroundColor: kThemeFg10,
													width: `100%`,
													borderRadius: `50%`,
												}"
												:inner-styles="{
													...styleFlexCenter(),
													padding: `16px`,
												}"
												show-overflow
											>
												<AppCurrencyImg
													asset-size="large"
													:currency="currency"
													:max-width="0"
													:style="currencyCardImgStyles"
													:ill-styles="currencyCardImgStyles"
												/>
											</AppAspectRatio>
										</div>

										<div
											class="text-center"
											:style="{
												...styleOverlayTextShadow,
												fontWeight: `bold`,
												fontSize: `17px`,
												fontFamily: kFontFamilyHeading,
												marginBottom: `8px`,
											}"
										>
											{{ formatNumber(amount) }}
										</div>

										<AppButton
											block
											solid
											:force-hover="hovered"
											:style="{
												pointerEvents: `none`,
											}"
										>
											{{
												$gettext(`Get %{ label }`, {
													label: currency.label,
												})
											}}
										</AppButton>
									</div>
								</AppOnHover>
							</template>
						</div>

						<div
							:style="[
								styleWhen(!hasProducts, {
									padding: `12px`,
								}),
								styleWhen(!hasProducts && !isLoading, {
									gridTemplateColumns: '1fr',
									alignContent: 'center',
								}),
							]"
						>
							<div v-if="isLoading && !hasProducts" class="_items">
								<AppAspectRatio
									v-for="i in 3"
									:key="i"
									:ratio="StickerPackRatio"
									show-overflow
								>
									<div
										:style="{
											...styleBorderRadiusLg,
											...styleChangeBg('bg-subtle'),
											...styleElevate(1),
											width: `100%`,
											height: `100%`,
										}"
									/>
								</AppAspectRatio>
							</div>
							<template v-else-if="hasProducts">
								<template v-for="chunk in availableProducts" :key="chunk.type">
									<template v-if="chunk && chunk.items.length">
										<h2
											:style="{
												display: `flex`,
												alignItems: `center`,
												gap: `12px`,
												marginTop: 0,
												padding: `12px 16px 0`,
												fontFamily: kFontFamilyDisplay,
												fontWeight: `bold`,
												color: kThemeFg,
											}"
										>
											<template v-if="chunk.type === 'packs'">
												{{ $gettext(`Sticker packs`) }}
											</template>
											<template v-else-if="chunk.type === 'avatarFrames'">
												{{ $gettext(`Avatar frames`) }}
											</template>
											<template v-else-if="chunk.type === 'backgrounds'">
												{{ $gettext(`Backgrounds`) }}
											</template>

											<AppJolticon
												v-app-tooltip.touchable="getTooltipText(chunk.type)"
												icon="help-circle"
												:style="{
													fontSize: `inherit`,
													margin: 0,
												}"
											/>
										</h2>

										<AppSpacer vertical :scale="2" />

										<div
											class="_items"
											:style="{
												padding: `0 12px 16px`,
											}"
										>
											<template
												v-for="shopProduct in chunk.items"
												:key="shopProduct.id"
											>
												<AppVendingMachineProduct
													:shop-product="shopProduct"
													:disable-purchases="!!productProcessing"
													@purchase="purchaseProduct($event)"
												/>
											</template>
										</div>
									</template>
								</template>
							</template>
							<AppIllustration v-else :asset="illNoCommentsSmall">
								<div>
									{{ $gettext(`There are no items available for purchase.`) }}
								</div>
							</AppIllustration>
						</div>
					</AppLoadingFade>
				</AppTheme>

				<div
					:style="{
						...styleFlexCenter({ direction: 'column' }),
						position: 'relative',
						backgroundColor: kThemeBgActual,
					}"
				>
					<!-- Vance -->
					<AppSpacer vertical :scale="4" />
					<div
						:style="{
							...styleMaxWidthForOptions({
								ratio: 1000 / 250,
								maxHeight: Math.max(Screen.height * 0.15, 80),
							}),
							width: `100%`,
						}"
					>
						<AppAspectRatio :ratio="4">
							<img
								:src="imageVance"
								:style="{
									width: `100%`,
									height: `100%`,
									userSelect: `none`,
								}"
								alt="Vending Vance"
							/>
						</AppAspectRatio>
					</div>
					<AppSpacer vertical :scale="4" />
				</div>
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
._items
	--pack-min-width: 200px
	color: var(--theme-fg)
	position: relative
	overflow: hidden
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(var(--pack-min-width), 1fr))
	align-content: start
	gap: 12px
	flex: auto

	@media $media-xs
		--pack-min-width: 140px
</style>
