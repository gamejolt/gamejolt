<script lang="ts" setup>
import { CSSProperties, Ref, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCurrencyImg from '../../../../_common/currency/AppCurrencyImg.vue';
import {
	Currency,
	CurrencyCostData,
	CurrencyType,
	canAffordCurrency,
} from '../../../../_common/currency/currency-type';
import {
	featureMicrotransactions,
	fetchFeatureToggles,
} from '../../../../_common/features/features.service';
import { formatNumber } from '../../../../_common/filters/number';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { InventoryShopProductSale } from '../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import { showPurchaseMicrotransactionModal } from '../../../../_common/microtransaction/purchase-modal/modal.service';
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../_common/modal/AppModalFloatingHeader.vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { useModal } from '../../../../_common/modal/modal.service';
import { storeModelList } from '../../../../_common/model/model-store.service';
import AppOnHover from '../../../../_common/on/AppOnHover.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerPack, {
	StickerPackRatio,
} from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackOpenModal } from '../../../../_common/sticker/pack/open-modal/modal.service';
import { useStickerStore } from '../../../../_common/sticker/sticker-store';
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
import { $gettext } from '../../../../_common/translate/translate.service';
import {
	styleBorderRadiusBase,
	styleBorderRadiusCircle,
	styleBorderRadiusLg,
	styleElevate,
	styleFlexCenter,
	styleMaxWidthForOptions,
	styleOverlayTextShadow,
	styleWhen,
} from '../../../../_styles/mixins';
import {
	kFontFamilyDisplay,
	kFontFamilyHeading,
	kFontSizeH3,
	kStrongEaseOut,
} from '../../../../_styles/variables';
import { run } from '../../../../utils/utils';
import { illNoCommentsSmall } from '../../../img/ill/illustrations';
import { useAppStore } from '../../../store/index';
import { routeQuests } from '../../../views/quests/quests.route';
import { purchaseShopProduct } from './_purchase-modal/AppPurchaseShopProductModal.vue';
import { showPurchaseShopProductModal } from './_purchase-modal/modal.service';
import imageVance from './vance.png';

const { stickerPacks } = useStickerStore();
const { clearPanes } = useAppStore();
const { isDark } = useThemeStore();
const { coinBalance, joltbuxBalance } = useCommonStore();

const balanceRefs = { coinBalance, joltbuxBalance };

const modal = useModal()!;
const router = useRouter();

const availableProducts = ref([]) as Ref<InventoryShopProductSale[]>;
const isLoading = ref(true);
const productProcessing = ref<number>();

const currencyCardData = computed(() => {
	const result = [{ currency: CurrencyType.coins, amount: coinBalance.value }];
	if (featureMicrotransactions.value) {
		result.push({ currency: CurrencyType.joltbux, amount: joltbuxBalance.value });
	}
	return result;
});

run(async () => {
	const p = await Promise.all([
		Api.sendRequest('/web/inventory/shop/sales', undefined, { detach: true }),
		Api.sendFieldsRequest(
			'/mobile/me',
			{
				coinBalance: true,
				buxBalance: true,
			},
			{ detach: true }
		),
	]);

	const payload = p[0];
	const newProducts = payload.sales
		? storeModelList(InventoryShopProductSale, payload.sales)
		: [];
	const validNewProducts = newProducts.filter(i => !!i.product);
	if (newProducts.length !== validNewProducts.length) {
		console.warn(`Got some products that we don't support yet.`, {
			'missing-count': newProducts.length - validNewProducts.length,
		});
	}
	availableProducts.value = validNewProducts;

	const mePayload = p[1];
	coinBalance.value = mePayload.coinBalance;
	joltbuxBalance.value = mePayload.buxBalance;

	await fetchFeatureToggles([featureMicrotransactions]);

	isLoading.value = false;
});

function canPurchaseProduct(shopProduct: InventoryShopProductSale) {
	return (
		shopProduct.validPricings.filter(
			i =>
				!!i.knownCurrencyType &&
				canAffordCurrency(i.knownCurrencyType, i.price, balanceRefs)
		).length > 0
	);
}

async function purchasePack(
	shopProduct: InventoryShopProductSale,
	currencyOptions: CurrencyCostData
) {
	if (productProcessing.value) {
		return;
	}
	const currencyOptionsList = Object.entries(currencyOptions);
	if (currencyOptionsList.length === 0) {
		showErrorGrowl($gettext(`This pack is not available for purchase right now.`));
		return;
	}
	if (!canPurchaseProduct(shopProduct)) {
		return;
	}

	productProcessing.value = shopProduct.id;

	if (currencyOptionsList.length === 1 && !!currencyOptions[CurrencyType.coins.id]) {
		// Purchase immediately with coins if it's our only option.
		await purchaseShopProduct({
			shopProduct,
			currency: CurrencyType.coins,
			balanceRefs,
			onItemPurchased: {
				pack(pack) {
					if (stickerPacks.value.some(i => i.id === pack.id)) {
						return;
					}
					stickerPacks.value.push(pack);
					StickerPackOpenModal.show({
						pack,
						openImmediate: false,
					});
				},
			},
		});
	} else {
		// Show a modal to let the user choose which currency to use.
		await showPurchaseShopProductModal({ shopProduct, currencyOptions });
	}

	productProcessing.value = undefined;
}

async function onClickCurrencyCard(currency: Currency) {
	if (currency.id === CurrencyType.coins.id) {
		// TODO(mtx-checkout) better modal for this
		const result = await ModalConfirm.show(
			$gettext(`You can earn coins by completing quests! Do you want to go to your quests?`),
			$gettext(`Looking for Coins?`),
			'yes'
		);

		if (!result) {
			return;
		}

		// Go to quests page if we're not already there.
		if (router.currentRoute.value.name !== routeQuests.name) {
			router.push({ name: routeQuests.name });
			return;
		}

		// Already on quests page, close the modal and any open shell sidebar.
		modal.dismiss();
		clearPanes();
	} else {
		showPurchaseMicrotransactionModal();
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
		// Handled around the Vending Vance illustration.
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	};
});

const currencyCardImgStyles: CSSProperties = {
	objectFit: `contain`,
	width: `100%`,
	height: `100%`,
};
</script>

<template>
	<AppModal force-theme="dark">
		<div :style="containerStyles">
			<AppModalFloatingHeader>
				<template #modal-controls>
					<AppButton @click="modal.dismiss()">
						{{ $gettext(`Close`) }}
					</AppButton>
				</template>
			</AppModalFloatingHeader>

			<div class="modal-body _wrapper">
				<AppTheme :force-dark="isDark" :force-light="!isDark">
					<AppLoadingFade
						class="fill-offset"
						:style="loadingFadeStyles"
						:content-styles="{
							...loadingFadeStyles,
							padding: `12px`,
						}"
						:is-loading="isLoading"
					>
						<div
							:style="{
								display: `flex`,
								gap: `12px`,
								marginBottom: `12px`,
							}"
						>
							<template
								v-for="{ currency, amount } of currencyCardData"
								:key="currency.id"
							>
								<AppOnHover>
									<template #default="{ binding, hovered }">
										<div
											v-bind="binding"
											:style="{
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
												...styleWhen(hovered, {
													...styleElevate(2),
													backgroundColor: kThemeBgBackdrop,
												}),
												// Need this to override the style from the `styleElevate` functions.
												transition: `background-color 200ms ${kStrongEaseOut}, box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important`,
											}"
											@click="onClickCurrencyCard(currency)"
										>
											<div
												class="text-center"
												:style="{
													fontFamily: kFontFamilyDisplay,
													fontSize: kFontSizeH3.px,
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
														...styleBorderRadiusCircle,
														backgroundColor: kThemeFg10,
														width: `100%`,
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
													fontStyle: 'italic',
													fontFamily: kFontFamilyHeading,
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
													$gettextInterpolate(`Get %{ label }`, {
														label: currency.label,
													})
												}}
											</AppButton>
										</div>
									</template>
								</AppOnHover>
							</template>
						</div>

						<div
							class="_items"
							:style="
								styleWhen(!isLoading && !availableProducts.length, {
									gridTemplateColumns: '1fr',
									alignContent: 'center',
								})
							"
						>
							<template v-if="isLoading">
								<AppAspectRatio
									v-for="i in 3"
									:key="i"
									:ratio="StickerPackRatio"
									show-overflow
								>
									<div class="_pack-placeholder" />
								</AppAspectRatio>
							</template>
							<template v-else-if="availableProducts.length">
								<template
									v-for="shopProduct in availableProducts"
									:key="shopProduct.id"
								>
									<div
										v-if="shopProduct.stickerPack"
										:style="{
											position: 'relative',
										}"
									>
										<AppStickerPack
											class="_pack"
											:pack="shopProduct.stickerPack"
											show-details
											:expiry-info="shopProduct.ends_on"
											:can-click-pack="!productProcessing"
											:cost-override="shopProduct.pricings"
											@click-pack="
												purchasePack(
													shopProduct,
													shopProduct.validPricingsData
												)
											"
										>
											<template #overlay>
												<div
													v-if="!canPurchaseProduct(shopProduct)"
													class="_radius-lg _text-shadow"
													:style="{
														position: 'absolute',
														top: 0,
														right: 0,
														bottom: 0,
														left: 0,
														fontSize: '13px',
														padding: '12px',
														zIndex: 2,
														display: 'grid',
														justifyContent: 'center',
														alignContent: 'center',
														textAlign: 'center',
														fontWeight: 'bold',
														color: `white`,
														backgroundColor: 'rgba(0, 0, 0, 0.45)',
													}"
												>
													{{
														$gettext(
															`You don't have enough funds to purchase this`
														)
													}}
												</div>
											</template>
										</AppStickerPack>
									</div>
								</template>
							</template>
							<AppIllustration v-else :asset="illNoCommentsSmall">
								<div>
									{{
										$gettext(
											`There are no sticker packs available for purchase.`
										)
									}}
								</div>
							</AppIllustration>
						</div>
					</AppLoadingFade>
				</AppTheme>

				<AppScrollAffix
					:style="{
						zIndex: 2,
					}"
					anchor="bottom"
					:offset-top="0"
					:padding="0"
				>
					<div
						:style="{
							...styleFlexCenter({ direction: 'column' }),
							position: 'relative',
							backgroundColor: kThemeBgActual,
						}"
					>
						<!-- vance -->
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
							<AppAspectRatio :ratio="1000 / 250">
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

						<!-- Rounded corner decorators -->
						<div class="_output-corner-tl">
							<AppTheme>
								<div class="_output-corner-tl-border" />
							</AppTheme>
							<div class="_output-corner-bg" />
						</div>
						<div class="_output-corner-tr">
							<AppTheme>
								<div class="_output-corner-tr-border" />
							</AppTheme>
							<div class="_output-corner-bg" />
						</div>
					</div>
				</AppScrollAffix>
			</div>
		</div>
	</AppModal>
</template>

<style lang="stylus" scoped>
._wrapper
	padding-top: 0
	padding-bottom: 0
	flex: auto
	display: flex
	flex-direction: column

._radius-lg
	rounded-corners-lg()

._text-shadow
	overlay-text-shadow()

._balance
	change-bg(bg-offset)
	rounded-corners-lg()
	padding: 2px 6px
	align-self: flex-end
	margin-right: auto
	font-weight: bold

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

._pack-placeholder
	rounded-corners-lg()
	change-bg(bg-subtle)
	elevate-1()
	width: 100%
	height: 100%

._pack
	z-index: 1

._output-corner-tl
._output-corner-tr
	width: 12px
	height: 12px
	position: absolute
	top: -12px
	z-index: 3

._output-corner-tl-border
._output-corner-tr-border
	border: 6px solid var(--theme-bg-offset)

._output-corner-tl
	left: 0

._output-corner-tr
	right: 0

._output-corner-tl-border
	border-bottom-left-radius: 12px

._output-corner-tr-border
	border-bottom-right-radius: 12px

._output-corner-bg
	background-color: var(--theme-bg)
	width: 100%
	height: 100%
	position: absolute
	left: 0
	top: 0
	z-index: -1
</style>
