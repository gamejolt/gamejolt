<script lang="ts" setup>
import { CSSProperties, Ref, computed, onMounted, ref, toRefs } from 'vue';
import { trackShopView } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { vAppAuthRequired } from '../../../../_common/auth/auth-required-directive';
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
import { InventoryShopSectionModel } from '../../../../_common/inventory/shop/inventory-shop-section.model';
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
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import {
	kThemeBgActual,
	kThemeBgBackdrop,
	kThemeBgOffset,
	kThemeBgSubtle,
	kThemeFg,
	kThemeFg10,
	kThemeFgMuted,
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
	kLineHeightBase,
	kStrongEaseOut,
} from '../../../../_styles/variables';
import { numberSort } from '../../../../utils/array';
import { showGetCoinsRedirectModal } from './_get-coins-redirect-modal/modal.service';
import AppVendingMachineProduct from './_product/AppVendingMachineProduct.vue';
import { showPurchaseShopProductModal } from './_purchase-modal/modal.service';
import imageVance from './vance.png';

interface Section {
	id: number;
	title: string;
	description: string;
	sort: number;
	sales: InventoryShopProductSaleModel[];
}

const props = defineProps({
	userId: {
		type: Number,
		default: undefined,
	},
});

const { userId } = toRefs(props);

const { isDark } = useThemeStore();
const { user: authUser, coinBalance, joltbuxBalance } = useCommonStore();

const modal = useModal()!;

const shopOwner = ref<UserModel>();
const sections = ref([]) as Ref<Section[]>;

const isLoading = ref(false);
const productProcessing = ref<number>();

const hasProducts = computed(() => {
	const data = sections.value.values();
	for (const { sales } of data) {
		if (sales.length > 0) {
			return true;
		}
	}
	return false;
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
		const sales = payload.sales
			? storeModelList(InventoryShopProductSaleModel, payload.sales)
			: [];

		const newSections: typeof sections.value = [];
		const validSales = new Map<number, InventoryShopProductSaleModel>();
		const unsupportedSales = new Map<number, InventoryShopProductSaleModel>();
		const sectionItems = storeModelList(InventoryShopSectionModel, payload.sections);

		// Prune the sales to only supported ones.
		for (const idx in sales) {
			const sale = sales[idx];
			if (!sale.stickerPack && !sale.avatarFrame && !sale.background) {
				unsupportedSales.set(sale.id, sale);
				continue;
			}
			validSales.set(sale.id, sale);
		}

		// Populate the section data objects with their sales.
		for (const sectionModel of sectionItems) {
			const section: Section = {
				id: sectionModel.id,
				title: sectionModel.title,
				description: sectionModel.description,
				sort: sectionModel.sort,
				sales: [],
			};

			if (sectionModel.item_list) {
				// Loop through the sale IDs and grab any matching valid sales.
				// The IDs are already sorted in the order the sales are meant
				// to be displayed.
				for (const saleId of sectionModel.item_list.sale_ids) {
					const sale = validSales.get(saleId);
					// Skip this section and log a warning if we don't have a
					// valid sale with this ID.
					if (!sale) {
						if (unsupportedSales.has(saleId)) {
							console.warn(
								`Item list referenced a sale (id: ${saleId}) that is not a supported type of sale.`
							);
						} else {
							console.warn(
								`Item list referenced a sale (id: ${saleId}) that is not present in the 'sales' field.`
							);
						}
						continue;
					}
					section.sales.push(sale);
				}

				// Only add the section if it has sales.
				if (section.sales.length > 0) {
					newSections.push(section);
				}
			} else {
				console.warn(`Unsupported section type for section ${sectionModel.id}`);
			}
		}

		// Sort the sections by their sort value. Sale items within the sections
		// are already pre-sorted.
		sections.value = newSections.sort((a, b) => numberSort(a.sort, b.sort));

		// Assign to our existing shopOwner or create a new one if available.
		if (shopOwner.value && payload.shopOwner) {
			shopOwner.value.assign(payload.shopOwner);
		} else {
			shopOwner.value = payload.shopOwner ? new UserModel(payload.shopOwner) : undefined;
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
	// Only authed users can interact with these.
	if (!authUser.value) {
		return;
	}

	if (currency.id === CurrencyType.joltbux.id) {
		trackShopView({ type: 'joltbux-card' });
		showPurchaseMicrotransactionModal();
	} else if (currency.id === CurrencyType.coins.id) {
		trackShopView({ type: 'coins-card' });
		const isRedirecting = await showGetCoinsRedirectModal();

		if (isRedirecting) {
			modal.dismiss();
		}
	} else {
		console.error('Unknown currency type', currency);
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
			<AppModalFloatingHeader>
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
				<div
					v-if="shopOwner"
					:style="{
						display: `flex`,
						gap: `12px`,
						alignItems: `center`,
						paddingTop: `8px`,
						paddingBottom: `16px`,
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
										v-app-auth-required
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
							:style="
								styleWhen(!hasProducts && !isLoading, {
									padding: `12px`,
									gridTemplateColumns: '1fr',
									alignContent: 'center',
								})
							"
						>
							<div
								v-if="isLoading && !hasProducts"
								class="fill-offset"
								:style="{
									...styleBorderRadiusLg,
									...styleElevate(1),
									padding: `8px`,
									marginLeft: `8px`,
									marginRight: `8px`,
									marginBottom: `12px`,
								}"
							>
								<div
									:style="{
										...styleBorderRadiusLg,
										height: `${kFontSizeH2.value * kLineHeightBase}px`,
										margin: 0,
										padding: `8px 12px 12px`,
										marginBottom: `12px`,
										backgroundColor: kThemeBgSubtle,
										width: `25%`,
									}"
								/>

								<div class="_items">
									<div
										v-for="i in 2"
										:key="i"
										:style="{
											...styleBorderRadiusLg,
											...styleChangeBg('bg-subtle'),
										}"
									>
										<AppAspectRatio :ratio="1" show-overflow />
										<div :style="{ height: `80px` }" />
									</div>
								</div>
							</div>
							<template v-else-if="hasProducts">
								<template v-for="section in sections" :key="section.id">
									<div
										v-if="section.sales.length"
										class="fill-offset"
										:style="{
											...styleBorderRadiusLg,
											...styleElevate(1),
											padding: `8px`,
											marginLeft: `8px`,
											marginRight: `8px`,
											marginBottom: `12px`,
										}"
									>
										<h2
											v-if="sections.length > 1"
											:style="{
												display: `flex`,
												alignItems: `center`,
												gap: `12px`,
												margin: 0,
												padding: `8px 12px 12px`,
												fontFamily: kFontFamilyDisplay,
												fontWeight: `bold`,
												color: kThemeFg,
											}"
										>
											{{ section.title }}

											<AppJolticon
												v-if="section.description"
												v-app-tooltip.touchable="section.description"
												icon="info-circle"
												:style="{
													margin: 0,
													fontSize: `inherit`,
													color: kThemeFgMuted,
												}"
											/>
										</h2>

										<div class="_items">
											<template v-for="sale in section.sales" :key="sale.id">
												<AppVendingMachineProduct
													:shop-product="sale"
													:disable-purchases="!!productProcessing"
													@purchase="purchaseProduct($event)"
												/>
											</template>
										</div>
									</div>
								</template>
							</template>
							<AppIllustration v-else :asset="illNoCommentsSmall">
								<div>
									{{ $gettext(`There are no items available for purchase.`) }}
								</div>
							</AppIllustration>
						</div>

						<AppSpacer vertical :scale="2" />
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
								ratio: 4,
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
	display: grid
	grid-template-columns: repeat(auto-fill, minmax(var(--pack-min-width), 1fr))
	align-content: start
	gap: 12px
	flex: auto

	@media $media-xs
		--pack-min-width: 140px
</style>
