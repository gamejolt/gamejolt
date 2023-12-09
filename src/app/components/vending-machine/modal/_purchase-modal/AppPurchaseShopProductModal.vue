<script lang="ts" setup>
import { PropType, Ref, computed, onMounted, onUnmounted, ref, toRefs, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { vAppAuthRequired } from '../../../../../_common/auth/auth-required-directive';
import { AvatarFrameModel } from '../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../_common/background/background.model';
import AppButton from '../../../../../_common/button/AppButton.vue';
import {
	AcquisitionMethod,
	AcquisitionModel,
} from '../../../../../_common/collectible/acquisition.model';
import AppCurrencyImg from '../../../../../_common/currency/AppCurrencyImg.vue';
import AppCurrencyPillList from '../../../../../_common/currency/AppCurrencyPillList.vue';
import {
	Currency,
	CurrencyType,
	canAffordCurrency,
} from '../../../../../_common/currency/currency-type';
import { shorthandReadableTime } from '../../../../../_common/filters/duration';
import { formatNumber } from '../../../../../_common/filters/number';
import { showInfoGrowl } from '../../../../../_common/growls/growls.service';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { illExtremeSadness } from '../../../../../_common/illustration/illustrations';
import AppShopProductDisplay from '../../../../../_common/inventory/shop/AppShopProductDisplay.vue';
import {
	InventoryShopProductSaleModel,
	purchaseShopProduct,
} from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import {
	PurchasableProductData,
	getShopProductDisplayData,
} from '../../../../../_common/inventory/shop/product-owner-helpers';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { showPurchaseMicrotransactionModal } from '../../../../../_common/microtransaction/purchase-modal/modal.service';
import AppModal from '../../../../../_common/modal/AppModal.vue';
import AppModalFloatingHeader from '../../../../../_common/modal/AppModalFloatingHeader.vue';
import { useModal } from '../../../../../_common/modal/modal.service';
import { storeModel, storeModelList } from '../../../../../_common/model/model-store.service';
import AppOnHover from '../../../../../_common/on/AppOnHover.vue';
import AppSectionTitle from '../../../../../_common/section/AppSectionTitle.vue';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import AppStickerGrid from '../../../../../_common/sticker/pack/AppStickerGrid.vue';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
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
import { UserModel } from '../../../../../_common/user/user.model';
import { styleBorderRadiusLg, styleFlexCenter, styleWhen } from '../../../../../_styles/mixins';
import {
	kBorderWidthBase,
	kFontFamilyDisplay,
	kFontFamilyTiny,
	kFontSizeH2,
	kFontSizeTiny,
	kStrongEaseOut,
} from '../../../../../_styles/variables';
import { getCurrentServerTime } from '../../../../../utils/server-time';
import { routeLandingHelpRedirect } from '../../../../views/landing/help/help.route';
import { showPurchaseShopProductConfirmModal } from './confirm/modal.service';
import { showGiftRecipientModal } from './gift-recipient/modal.service';

const props = defineProps({
	initialProductData: {
		type: Object as PropType<PurchasableProductData>,
		required: true,
	},
	onItemPurchased: {
		type: Function as PropType<() => void>,
		default: undefined,
	},
});

const { initialProductData, onItemPurchased } = toRefs(props);

const modal = useModal()!;
const router = useRouter();
const { stickerPacks } = useStickerStore();
const { user: authUser, coinBalance, joltbuxBalance } = useCommonStore();

const sale = ref<InventoryShopProductSaleModel>();
const partialProductData = ref(getShopProductDisplayData(initialProductData.value));

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
const giftUser = ref<UserModel>();

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
	const { resource, resourceId } = partialProductData.value;
	isLoading.value = true;

	let newAcquisitions: AcquisitionModel[] = [];
	let newPackContents: StickerModel[] = [];
	let newSale: InventoryShopProductSaleModel | undefined = undefined;

	try {
		const payloads = await Promise.all([
			Api.sendFieldsRequest(
				`/mobile/shop-product/${resource}/${resourceId}`,
				{
					resource: true,
					acquisitionMethods: {
						primaryOnly: true,
					},
					packContents: true,
				},
				{ detach: true }
			),
			Api.sendFieldsRequest(
				'/mobile/me',
				{ coinBalance: true, buxBalance: true },
				{ detach: true }
			),
		]);

		const payload = payloads[0];
		newAcquisitions = storeModelList(AcquisitionModel, payload.acquisitionMethods);
		newPackContents = storeModelList(StickerModel, payload.packContents);
		newSale = newAcquisitions.find(i => i.sale)?.sale;

		// Add the new models to the model store.
		if (resource === 'Avatar_Frame') {
			storeModel(AvatarFrameModel, payload.resource);
		} else if (resource === 'Background') {
			storeModel(BackgroundModel, payload.resource);
		} else if (resource === 'Sticker_Pack') {
			storeModel(StickerPackModel, payload.resource);
		}

		const currencyPayload = payloads[1];
		const newCoinBalance = currencyPayload.coinBalance;
		const newJoltbuxBalance = currencyPayload.buxBalance;
		if (typeof newCoinBalance === 'number') {
			coinBalance.value = newCoinBalance;
		}
		if (typeof newJoltbuxBalance === 'number') {
			joltbuxBalance.value = newJoltbuxBalance;
		}
	} catch (e) {
		console.error('Failed to fetch sale through resource/resourceId pair.', e);
	} finally {
		acquisitions.value = newAcquisitions;
		packContents.value = newPackContents;
		sale.value = newSale;
		// Grab new model data now that it may have been loading into the model
		// store.
		partialProductData.value = getShopProductDisplayData({
			resource,
			resourceId,
		});
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

const disablePurchaseButtons = computed(() => {
	if (isExpired.value || !!processingPurchaseCurrencyId.value) {
		return true;
	}
	if (giftUser.value) {
		return false;
	}
	if (actionOptionsData.value?.canPurchaseForSelf) {
		return false;
	}
	return true;
});

const actionOptionsData = computed<{
	text: string;
	canPurchaseForSelf?: boolean;
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
				canPurchaseForSelf: false,
			};
		}
		return { text: $gettext(`This is currently unobtainable`) };
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
		canPurchaseForSelf: true,
	};
});

/**
 * Purchases an inventory shop product using the specified Currency.
 */
async function purchaseProduct(currency: Currency) {
	if (processingPurchaseCurrencyId.value || !sale.value) {
		return;
	}
	processingPurchaseCurrencyId.value = currency.id;

	const giftTo = giftUser.value;
	if (giftTo) {
		const canContinue = await showPurchaseShopProductConfirmModal({ giftUser: giftTo });

		if (!canContinue) {
			processingPurchaseCurrencyId.value = undefined;
			return;
		}
	}

	await purchaseShopProduct({
		sale: sale.value,
		stickerPacks,
		currency,
		balanceRefs,
		onSuccess() {
			modal.dismiss();
			onItemPurchased?.value?.();

			if (giftTo) {
				showInfoGrowl($gettext(`Your gift was sent to @${giftTo.username}`));
			}
		},
		giftTo,
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

async function onClickGift(sale: InventoryShopProductSaleModel) {
	const user = await showGiftRecipientModal({
		sale,
	});
	if (user) {
		giftUser.value = user;
	}
}
</script>

<template>
	<AppModal>
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

		<div class="modal-body">
			<AppLoadingFade :is-loading="isLoading">
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
					<AppShopProductDisplay
						:product-data="productData"
						:avatar-frame-user="giftUser"
					/>

					<AppSpacer vertical :scale="8" />

					<div v-if="actionOptionsData" :style="{ width: `100%` }">
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
						<div
							v-else
							:style="{
								display: `flex`,
								columnGap: `8px`,
								alignItems: `center`,
								height: `56px`,
								width: `100%`,
							}"
						>
							<template v-if="!giftUser">
								<AppButton
									v-if="sale"
									icon="gift"
									circle
									solid
									:style="{ visibility: `hidden`, pointerEvents: `none` }"
								/>
								<div
									class="text-center"
									:style="{
										fontFamily: kFontFamilyDisplay,
										fontSize: kFontSizeH2.px,
										flex: `auto`,
									}"
								>
									{{ actionOptionsData.text }}
								</div>
								<AppButton
									v-if="sale"
									v-app-tooltip="$gettext(`Gift this to a friend`)"
									icon="gift"
									circle
									solid
									@click="onClickGift(sale)"
								/>
							</template>
							<template v-else>
								<div
									:style="{
										display: `flex`,
										columnGap: `12px`,
										width: `100%`,
										backgroundColor: kThemeBgOffset,
										padding: `12px`,
										...styleBorderRadiusLg,
									}"
								>
									<AppSectionTitle :style="{ flex: `auto` }">
										<template #avatar>
											<AppUserAvatarBubble
												:user="giftUser"
												show-verified
												show-frame
												smoosh
												disable-link
											/>
										</template>

										<template #supertitle>
											{{ $gettext(`Gifting to`) }}
										</template>

										<template #title> @{{ giftUser.username }} </template>
									</AppSectionTitle>

									<div :style="{ alignSelf: `center` }">
										<AppButton
											solid
											circle
											icon="remove"
											@click="giftUser = undefined"
										/>
									</div>
								</div>
							</template>
						</div>
					</div>

					<template v-if="timeRemaining">
						<AppSpacer vertical :scale="2" />

						<div>
							{{ timeRemaining }}
						</div>
					</template>

					<AppSpacer vertical :scale="4" />

					<template v-if="!disablePurchaseButtons || sale">
						<div
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
									disablePurchaseButtons ||
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

						<template
							v-if="
								!canPurchaseAny && currencyOptionsList.length == 1 && joltbuxEntry
							"
						>
							<AppSpacer vertical :scale="6" />

							<div class="text-center">
								{{ $gettext(`You can purchase this item with Joltbux`) }}
							</div>
						</template>

						<template v-if="showPurchaseJoltbuxButton">
							<AppSpacer vertical :scale="3" />

							<AppButton
								v-app-auth-required
								primary
								trans
								block
								@click="onClickGetJoltbux()"
							>
								{{ $gettext(`Get Joltbux`) }}
							</AppButton>
						</template>
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
			</AppLoadingFade>
		</div>
	</AppModal>
</template>
