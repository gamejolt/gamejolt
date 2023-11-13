<script lang="ts">
import { PropType, Ref, computed, onMounted, onUnmounted, ref, toRefs, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import AppAlertBox from '../../../../../_common/alert/AppAlertBox.vue';
import { Api } from '../../../../../_common/api/api.service';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import { vAppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import {
	AvatarFrameModel,
	DefaultAvatarFrameScale,
} from '../../../../../_common/avatar/frame.model';
import AppBackgroundFade from '../../../../../_common/background/AppBackgroundFade.vue';
import {
	BackgroundModel,
	getBackgroundImgUrl,
} from '../../../../../_common/background/background.model';
import AppButton from '../../../../../_common/button/AppButton.vue';
import {
	AcquisitionMethod,
	AcquisitionModel,
} from '../../../../../_common/collectible/acquisition.model';
import { CollectibleModel } from '../../../../../_common/collectible/collectible.model';
import AppCurrencyImg from '../../../../../_common/currency/AppCurrencyImg.vue';
import {
	Currency,
	CurrencyType,
	canAffordCurrency,
} from '../../../../../_common/currency/currency-type';
import { shorthandReadableTime } from '../../../../../_common/filters/duration';
import { formatNumber } from '../../../../../_common/filters/number';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { illExtremeSadness } from '../../../../../_common/illustration/illustrations';
import AppImgResponsive from '../../../../../_common/img/AppImgResponsive.vue';
import { InventoryShopProductSaleModel } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import { showPurchaseMicrotransactionModal } from '../../../../../_common/microtransaction/purchase-modal/modal.service';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import {
	getModel,
	storeModel,
	storeModelList,
} from '../../../../../_common/model/model-store.service';
import AppOnHover from '../../../../../_common/on/AppOnHover.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import AppStickerGrid from '../../../../../_common/sticker/pack/AppStickerGrid.vue';
import { StickerPackRatio } from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { showStickerPackOpenModal } from '../../../../../_common/sticker/pack/open-modal/modal.service';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { UserStickerPackModel } from '../../../../../_common/sticker/pack/user-pack.model';
import { useStickerStore } from '../../../../../_common/sticker/sticker-store';
import { StickerModel } from '../../../../../_common/sticker/sticker.model';
import { useCommonStore } from '../../../../../_common/store/common-store';
import {
	kThemeBgOffset,
	kThemeFg,
	kThemeFgMuted,
	kThemePrimary,
} from '../../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { UserAvatarFrameModel } from '../../../../../_common/user/user-avatar/frame/frame.model';
import { UserModel } from '../../../../../_common/user/user.model';
import {
	styleBorderRadiusLg,
	styleFlexCenter,
	styleMaxWidthForOptions,
	styleWhen,
} from '../../../../../_styles/mixins';
import {
	kBorderWidthBase,
	kFontFamilyDisplay,
	kFontFamilyTiny,
	kFontSizeH2,
	kFontSizeSmall,
	kFontSizeTiny,
	kStrongEaseOut,
} from '../../../../../_styles/variables';
import { getCurrentServerTime } from '../../../../../utils/server-time';
import { isInstance } from '../../../../../utils/utils';
import { routeLandingHelpRedirect } from '../../../../views/landing/help/help.route';
import { showNewProductModal } from '../_product/modal/modal.service';
import { PurchasableProduct } from './modal.service';

interface BasePurchaseData {
	resource: 'Avatar_Frame' | 'Background' | 'Sticker_Pack';
	resourceId: number;
	name: string | undefined;
	imgUrl: string | undefined;
	processMediaserverUrl?: boolean;
}
interface AvatarFramePurchaseData extends BasePurchaseData {
	resource: 'Avatar_Frame';
	scale?: number;
}
interface BackgroundPurchaseData extends BasePurchaseData {
	resource: 'Background';
}
interface StickerPackPurchaseData extends BasePurchaseData {
	resource: 'Sticker_Pack';
}

type NormalizedProductData =
	| AvatarFramePurchaseData
	| BackgroundPurchaseData
	| StickerPackPurchaseData;

function getShopProductDisplayData(data: PurchasableProduct): NormalizedProductData | undefined {
	if (isInstance(data, CollectibleModel)) {
		const resource = data.type;
		const resourceId = parseInt(data.id.split(':').reverse()[0], 10);

		if (resource === 'Avatar_Frame') {
			return {
				resource,
				resourceId,
				imgUrl: data.image_url,
				name: data.name,
				scale: DefaultAvatarFrameScale,
			};
		} else if (resource === 'Background') {
			return {
				resource,
				resourceId,
				imgUrl: data.image_url,
				name: data.name,
			};
		}
		// Unsupported resource.
		return undefined;
	}

	let avatarFrame = isInstance(data, AvatarFrameModel) ? data : null;
	let background = isInstance(data, BackgroundModel) ? data : null;
	let stickerPack = isInstance(data, StickerPackModel) ? data : null;

	if (isInstance(data, InventoryShopProductSaleModel)) {
		if (data.avatarFrame) {
			avatarFrame = data.avatarFrame;
		} else if (data.background) {
			background = data.background;
		} else if (data.stickerPack) {
			stickerPack = data.stickerPack;
		}
	}

	if ('resource' in data && 'resourceId' in data) {
		const { resource, resourceId } = data;
		// Check the model store for existing data we can use.
		if (resource === 'Avatar_Frame') {
			avatarFrame = getModel(AvatarFrameModel, resourceId) || null;
		} else if (resource === 'Background') {
			background = getModel(BackgroundModel, resourceId) || null;
		} else if (resource === 'Sticker_Pack') {
			stickerPack = getModel(StickerPackModel, resourceId) || null;
		}

		// If we haven't loaded in these models yet, return the
		// resource/resourceId pair so we can fetch it.
		if (!avatarFrame && !background && !stickerPack) {
			return {
				resourceId,
				resource,
				name: undefined,
				imgUrl: undefined,
			};
		}
	}

	if (avatarFrame) {
		return {
			resource: 'Avatar_Frame',
			resourceId: avatarFrame.id,
			name: avatarFrame.name,
			scale: avatarFrame.scale,
			imgUrl: avatarFrame.image_url,
		};
	} else if (background) {
		return {
			resource: 'Background',
			resourceId: background.id,
			name: background.name,
			imgUrl: getBackgroundImgUrl(background),
		};
	} else if (stickerPack) {
		const media = stickerPack.media_item;
		const mediaserverUrl = media.is_animated ? null : media.mediaserver_url;
		return {
			resource: 'Sticker_Pack',
			resourceId: stickerPack.id,
			name: stickerPack.name,
			imgUrl: mediaserverUrl ?? media.img_url,
			processMediaserverUrl: !!mediaserverUrl,
		};
	}
	return undefined;
}

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
	initialProduct: {
		type: Object as PropType<PurchasableProduct>,
		required: true,
	},
	onItemPurchased: {
		type: Function as PropType<() => void>,
		default: undefined,
	},
});

const { initialProduct, onItemPurchased } = toRefs(props);

const modal = useModal()!;
const router = useRouter();
const { stickerPacks } = useStickerStore();
const { user: authUser, coinBalance, joltbuxBalance } = useCommonStore();

const sale = ref<InventoryShopProductSaleModel>();
const partialProductData = ref(getShopProductDisplayData(initialProduct.value));

const productData = computed(() => {
	const data = partialProductData.value;
	if (data && data.imgUrl && data.name) {
		return {
			...data,
			imgUrl: data.imgUrl,
			name: data.name,
		};
	}
	return undefined;
});

const acquisitions = ref([]) as Ref<AcquisitionModel[]>;
const packContents = ref([]) as Ref<StickerModel[]>;
const isLoading = ref(false);

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

	timeRemaining.value = $gettext(`Limited time only: %{ time }`, {
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

// Fetch everything we need to display sale, acquisition, and product data.
onMounted(async () => {
	// Invalid item.
	if (!partialProductData.value) {
		return;
	}
	const { resource: resource, resourceId: resourceId } = partialProductData.value;
	isLoading.value = true;

	let newAcquisitions: AcquisitionModel[] = [];
	let newPackContents: StickerModel[] = [];
	let newSale: InventoryShopProductSaleModel | undefined = undefined;
	let newProductData: NormalizedProductData | undefined = undefined;

	try {
		const payload = await Api.sendFieldsRequest(
			`/mobile/shop-product/${resource}/${resourceId}`,
			{
				product: true,
				acquisitionMethods: {
					primaryOnly: true,
				},
				packContents: true,
			},
			{ detach: true }
		);

		newAcquisitions = storeModelList(AcquisitionModel, payload.acquisitionMethods);
		newPackContents = storeModelList(StickerModel, payload.packContents);
		newSale = newAcquisitions.find(i => i.sale)?.sale;

		if (resource === 'Avatar_Frame') {
			newProductData = getShopProductDisplayData(
				storeModel(AvatarFrameModel, payload.product)
			);
		} else if (resource === 'Background') {
			newProductData = getShopProductDisplayData(
				storeModel(BackgroundModel, payload.product)
			);
		} else if (resource === 'Sticker_Pack') {
			newProductData = getShopProductDisplayData(
				storeModel(StickerPackModel, payload.product)
			);
		}
	} catch (e) {
		console.error('Failed to fetch sale through resource/resourceId pair.', e);
	} finally {
		acquisitions.value = newAcquisitions;
		packContents.value = newPackContents;
		sale.value = newSale;
		partialProductData.value = newProductData;
		isLoading.value = false;
	}
});

onUnmounted(() => {
	if (timerBuilder) {
		clearInterval(timerBuilder);
		timerBuilder = null;
	}
});

const currencyOptions = computed(() => {
	if (!sale.value) {
		return {};
	}
	return sale.value.validPricingsData;
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
	() => productData.value?.resource === 'Sticker_Pack' && !!joltbuxEntry.value
);

const productType = computed(() => {
	if (!productData.value) {
		return null;
	}
	const { resource } = productData.value;
	if (resource === 'Avatar_Frame') {
		return $gettext(`Avatar frame`);
	} else if (resource === 'Background') {
		return $gettext(`Background`);
	} else if (resource === 'Sticker_Pack') {
		return $gettext(`Sticker pack`);
	}
	return null;
});

const actionOptionsData = computed<{
	text: string;
	canPurchase?: boolean;
	chargeUser?: UserModel;
} | null>(() => {
	if (!sale.value) {
		if (isLoading.value) {
			return null;
		}

		const chargeRewardAcquisitions = acquisitions.value.filter(
			i => i.method === AcquisitionMethod.ChargeReward
		);
		if (chargeRewardAcquisitions.length) {
			const chargeUser = chargeRewardAcquisitions.find(i => i.owner_user)?.owner_user;
			return {
				chargeUser,
				text:
					chargeUser && authUser.value?.id === chargeUser.id
						? $gettext(
								`Other users will get this when they place a charged sticker on your content`
						  )
						: $gettext(
								`You can obtain this by placing a charged sticker on this creator's content`
						  ),
				canPurchase: false,
			};
		}
		return null;
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
		text: $gettext(`Get this item`),
		canPurchase: true,
	};
});

const frameOverride = computed(() => {
	if (!productData.value || productData.value.resource !== 'Avatar_Frame') {
		return undefined;
	}
	return {
		image_url: productData.value.imgUrl,
		scale: productData.value.scale ?? DefaultAvatarFrameScale,
	};
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

function onClickGetJoltbux() {
	// vAppAuthRequired didn't seem to prevent the onClick directly on the
	// button, so check here before showing the modal.
	if (!authUser.value) {
		return;
	}
	showPurchaseMicrotransactionModal();
}

function gotoCreator(user: UserModel) {
	modal.dismiss();
	router.push(user.routeLocation);
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

		<div class="modal-body">
			<div v-if="!productData" :style="styleFlexCenter({ direction: 'column' })">
				<div v-if="isLoading" :style="{ ...styleFlexCenter(), minHeight: `300px` }">
					<AppLoading centered stationary />
				</div>
				<template v-else>
					<AppIllustration :asset="illExtremeSadness">
						{{
							$gettext(
								`We couldn't find what you were looking for. Please try again another time.`
							)
						}}
					</AppIllustration>
				</template>
			</div>
			<div v-else :style="styleFlexCenter({ direction: 'column' })">
				<div
					:style="
						getItemWidthStyles(
							productData.resource === 'Sticker_Pack' ? StickerPackRatio : 1
						)
					"
				>
					<AppUserAvatarBubble
						v-if="productData.resource === 'Avatar_Frame'"
						:user="authUser"
						:frame-override="frameOverride"
						:show-frame="!!frameOverride"
						smoosh
						disable-link
					/>
					<AppAspectRatio
						v-else
						v-bind="
							productData.resource === 'Sticker_Pack'
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
						<AppBackgroundFade v-if="productData.resource === 'Background'" />
					</AppAspectRatio>
				</div>

				<div
					:style="{
						marginTop: `8px`,
						alignSelf: `center`,
						color: kThemeFgMuted,
						fontSize: kFontSizeSmall.px,
					}"
				>
					{{ productType }}
				</div>

				<div
					v-if="productData.name"
					:style="{
						fontWeight: 700,
					}"
				>
					{{ productData.name }}
				</div>

				<AppSpacer vertical :scale="8" />

				<div v-if="actionOptionsData && actionOptionsData.text" :style="{ width: `100%` }">
					<template v-if="actionOptionsData.chargeUser">
						<AppOnHover>
							<template #default="{ hoverBinding, hovered }">
								<a
									v-bind="{
										...hoverBinding,
										style: {
											background: kThemeBgOffset,
											...styleBorderRadiusLg,
											borderColor: `transparent`,
											display: `block`,
											// borderColor: kThemePrimary,
											borderStyle: `solid`,
											borderWidth: kBorderWidthBase.px,
											padding: `${12 - kBorderWidthBase.value}px`,
											transition: `border-color 300ms ${kStrongEaseOut}`,
											...styleWhen(hovered, {
												borderColor: kThemePrimary,
											}),
										},
									}"
									@click="gotoCreator(actionOptionsData.chargeUser)"
								>
									<div
										:style="{
											display: `grid`,
											gridTemplateColumns: `64px minmax(0, 1fr)`,
											gap: `12px`,
											color: kThemeFg,
										}"
									>
										<AppUserAvatarBubble
											:user="actionOptionsData.chargeUser"
											smoosh
											disable-link
										/>
										<div>
											<div :style="{ color: kThemeFgMuted }">
												@{{ actionOptionsData.chargeUser.username }}
											</div>
											{{ actionOptionsData.text }}
										</div>
									</div>

									<AppButton
										:style="{ marginTop: `12px` }"
										:force-hover="hovered"
										block
									>
										{{ $gettext(`View profile`) }}
									</AppButton>
								</a>
							</template>
						</AppOnHover>
					</template>
					<AppAlertBox v-else-if="!actionOptionsData.canPurchase" icon="info-circle">
						{{ actionOptionsData.text }}
					</AppAlertBox>
					<div
						v-else
						class="text-center"
						:style="{ fontFamily: kFontFamilyDisplay, fontSize: kFontSizeH2.px }"
					>
						{{ actionOptionsData.text }}
					</div>
				</div>

				<template v-if="timeRemaining">
					<AppSpacer vertical :scale="2" />

					<div>
						{{ timeRemaining }}
					</div>
				</template>

				<AppSpacer vertical :scale="4" />

				<div
					v-if="actionOptionsData && actionOptionsData.canPurchase"
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

					<AppSpacer vertical :scale="4" />
				</template>

				<AppSpacer vertical :scale="4" />

				<div :style="{ width: `100%` }">
					<template v-if="productData.resource === 'Sticker_Pack'">
						{{
							$gettext(
								`You'll get a random selection of these stickers when you open this pack. Collect them all! Place them on top of posts!`
							)
						}}

						{{ ' ' }}

						<span
							v-app-tooltip.touchable="$gettext(`yum`)"
							:style="{
								textDecoration: 'line-through',
								fontSize: kFontSizeTiny.px,
								fontFamily: kFontFamilyTiny,
							}"
						>
							{{ $gettext(`Eat them!`) }}
						</span>

						<AppSpacer vertical :scale="4" />
						<AppStickerGrid :stickers="packContents" />
					</template>
					<template v-else-if="productData.resource === 'Avatar_Frame'">
						{{
							$gettext(
								`Equip an avatar frame to make yourself stand out in the community.`
							)
						}}
					</template>
					<template v-else-if="productData.resource === 'Background'">
						{{
							$gettext(
								`Backgrounds can be added to your posts to make your content stand out in the feeds.`
							)
						}}
					</template>
				</div>
			</div>
		</div>
	</AppModal>
</template>
