<script lang="ts" setup>
import { CSSProperties, Ref, computed, onMounted, ref, toRefs } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCurrencyPillList from '../../../../_common/currency/AppCurrencyPillList.vue';
import { CurrencyType } from '../../../../_common/currency/currency-type';
import {
	featureMicrotransactions,
	fetchFeatureToggles,
} from '../../../../_common/features/features.service';
import AppIllustration from '../../../../_common/illustration/AppIllustration.vue';
import { illNoCommentsSmall } from '../../../../_common/illustration/illustrations';
import { InventoryShopProductSaleModel } from '../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import { InventoryShopSectionModel } from '../../../../_common/inventory/shop/inventory-shop-section.model';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppModal from '../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../_common/modal/AppModalFloatingHeader.vue';
import { useModal } from '../../../../_common/modal/modal.service';
import { storeModel, storeModelList } from '../../../../_common/model/model-store.service';
import AppOnHover from '../../../../_common/on/AppOnHover.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { StickerPackRatio } from '../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTheme from '../../../../_common/theme/AppTheme.vue';
import { useThemeStore } from '../../../../_common/theme/theme.store';
import {
	kThemeBgActual,
	kThemeBgBackdrop,
	kThemeBgSubtle,
	kThemeFg,
	kThemeFgMuted,
	kThemePrimary,
} from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserModel } from '../../../../_common/user/user.model';
import {
	kElevateTransition,
	styleBorderRadiusLg,
	styleChangeBg,
	styleElevate,
	styleFlexCenter,
	styleMaxWidthForOptions,
	styleTextOverflow,
	styleTyped,
	styleWhen,
} from '../../../../_styles/mixins';
import {
	kBorderWidthBase,
	kFontFamilyDisplay,
	kFontSizeBase,
	kFontSizeH2,
	kFontSizeH3,
	kFontSizeSmall,
	kLineHeightBase,
	kStrongEaseOut,
} from '../../../../_styles/variables';
import { numberSort } from '../../../../utils/array';
import { getMediaserverUrlForBounds } from '../../../../utils/image';
import { run } from '../../../../utils/utils';
import AppVendingMachineCurrencyCard from './AppVendingMachineCurrencyCard.vue';
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
const chargeRewardPack = ref<StickerPackModel>();

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
	const productUrlParams: string[] = [`include_unpurchasable=true`];
	if (userId?.value) {
		productUrlParams.push(`userId=${userId.value}`);
	}
	if (productUrlParams.length) {
		productUrl += `?${productUrlParams.join('&')}`;
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
		chargeRewardPack.value = payload.chargeRewardPack
			? storeModel(StickerPackModel, payload.chargeRewardPack)
			: undefined;

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

async function purchaseProduct(sale: InventoryShopProductSaleModel) {
	if (productProcessing.value) {
		return;
	}
	const resourceId = sale.avatarFrame?.id || sale.background?.id || sale.stickerPack?.id;
	if (!resourceId) {
		return;
	}

	productProcessing.value = sale.id;

	// Show a modal to let the user choose which currency to use.
	await showPurchaseShopProductModal({
		resource: sale.product_type,
		resourceId,
		onItemPurchased: () => init(),
	});
	productProcessing.value = undefined;
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

const shopOwnerNameStyles: CSSProperties = {
	...styleTextOverflow,
	flex: `auto`,
	minWidth: 0,
	margin: 0,
};

const rewardPackLabelFontSize = kFontSizeH3;
const rewardPackDescriptionFontSize = kFontSizeBase;
const rewardPackLinkHintFontSize = kFontSizeSmall;
const rewardPackImageSize = run(() => {
	const fontSizes =
		rewardPackLabelFontSize.value +
		rewardPackDescriptionFontSize.value +
		rewardPackLinkHintFontSize.value;

	const height = Math.floor(fontSizes * kLineHeightBase);
	return {
		width: height * StickerPackRatio,
		height,
	};
});
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

					<h2 :style="shopOwnerNameStyles">
						{{
							$gettext(`@%{ username }'s Shop`, {
								username: shopOwner.username,
							})
						}}
					</h2>
				</div>

				<AppTheme :force-dark="isDark" :force-light="!isDark">
					<AppLoadingFade
						class="fill-offset"
						:style="loadingFadeStyles"
						:content-styles="loadingFadeStyles"
						:is-loading="isLoading"
					>
						<div
							:style="{
								display: `grid`,
								gridTemplateColumns: `repeat(auto-fit, minmax(0, 1fr))`,
								padding: `8px`,
								gap: `12px`,
							}"
						>
							<AppVendingMachineCurrencyCard
								v-for="{ currency, amount } of currencyCardData"
								:key="currency.id"
								:currency="currency"
								:amount="amount"
							/>
						</div>

						<template v-if="chargeRewardPack">
							<AppOnHover>
								<template #default="{ hoverBinding, hovered }">
									<!-- Charge/Reward pack info -->
									<a
										class="fill-offset"
										v-bind="{
											...hoverBinding,
											style: styleTyped({
												display: `flex`,
												gap: `12px`,
												justifyContent: `space-between`,
												margin: `0 8px`,
												padding: `${12 - kBorderWidthBase.value}px`,
												borderWidth: kBorderWidthBase.px,
												borderStyle: `solid`,
												borderColor: `transparent`,
												// Required for dark/light mode to work.
												color: kThemeFg,
												...styleBorderRadiusLg,
												...styleElevate(1),
												...styleWhen(hovered, {
													...styleElevate(2),
													borderColor: kThemePrimary,
													backgroundColor: kThemeBgBackdrop,
												}),
												// Needs to come after [styleElevate] calls.
												transition: `background-color 200ms ${kStrongEaseOut}, border-color 250ms ${kStrongEaseOut}, ${kElevateTransition}`,
											}),
										}"
										@click="
											showPurchaseShopProductModal({
												resource: 'Sticker_Pack',
												resourceId: chargeRewardPack.id,
											})
										"
									>
										<!-- Label and description -->
										<div>
											<div
												:style="{
													fontSize: rewardPackLabelFontSize.px,
													fontFamily: kFontFamilyDisplay,
												}"
											>
												{{ $gettext(`Reward Pack`) }}
											</div>
											<div
												:style="{
													fontSize: rewardPackDescriptionFontSize.px,
													fontWeight: `500`,
												}"
											>
												{{
													authUser && authUser.id === shopOwner?.id
														? $gettext(
																`Users will get this reward pack every time they place a charged sticker on your content`
														  )
														: $gettext(
																`Place a charged sticker on this user's content to get their reward pack`
														  )
												}}
											</div>
											<div
												:style="{
													fontSize: rewardPackLinkHintFontSize.px,
													fontStyle: `italic`,
												}"
											>
												({{ $gettext(`Click to view contents`) }})
											</div>
										</div>

										<!-- Pack image -->
										<img
											:width="rewardPackImageSize.width"
											:height="rewardPackImageSize.height"
											:src="
												chargeRewardPack.media_item.is_animated
													? chargeRewardPack.media_item.img_url
													: getMediaserverUrlForBounds({
															src: chargeRewardPack.media_item
																.mediaserver_url,
															maxWidth: rewardPackImageSize.width,
															maxHeight: rewardPackImageSize.height,
													  })
											"
											alt=""
										/>
									</a>
								</template>
							</AppOnHover>

							<AppSpacer :scale="2" vertical />
						</template>

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
