<script lang="ts" setup>
import { computed, toRef } from 'vue';

import { ShopViewType, trackShopView } from '~common/analytics/analytics.service';
import AppAspectRatio from '~common/aspect-ratio/AppAspectRatio.vue';
import AppBackground from '~common/background/AppBackground.vue';
import AppCollectibleUnlockedRibbon from '~common/collectible/AppCollectibleUnlockedRibbon.vue';
import AppCurrencyPillList from '~common/currency/AppCurrencyPillList.vue';
import { shorthandReadableTime } from '~common/filters/duration';
import { InventoryShopProductSaleModel } from '~common/inventory/shop/inventory-shop-product-sale.model';
import { useOnHover } from '~common/on/useOnHover';
import { getScreen } from '~common/screen/screen-service';
import AppStickerPack, {
	StickerPackExpiryStyles,
	StickerPackRatio,
} from '~common/sticker/pack/AppStickerPack.vue';
import { useCommonStore } from '~common/store/common-store';
import { kThemeFg, kThemeFgMuted, kThemeGray } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleElevate, styleTyped, styleWhen } from '~styles/mixins';
import { kBorderRadiusLg, kFontSizeSmall, kStrongEaseOut } from '~styles/variables';

type Props = {
	shopProduct: InventoryShopProductSaleModel;
	/**
	 * Used to prevent further purchases while we're processing one.
	 */
	disablePurchases?: boolean;
};
const { shopProduct, disablePurchases } = defineProps<Props>();

const emit = defineEmits<{
	purchase: [shopProduct: InventoryShopProductSaleModel];
}>();

const { user: myUser } = useCommonStore();

const name = computed(() => shopProduct.product?.name || '');

const { hoverBinding, hovered } = useOnHover({
	disable: toRef(() => !getScreen().isPointerMouse.value),
});

function onClickProduct() {
	if (disablePurchases) {
		return;
	}

	let type: ShopViewType = 'unhandled-product';
	const i = shopProduct;
	if (i.avatarFrame) {
		type = 'avatar-frame';
	} else if (i.background) {
		type = 'background';
	} else if (i.stickerPack) {
		type = 'sticker-pack';
	}

	trackShopView({ type });
	emit('purchase', shopProduct);
}

const overlayTagZIndex = 2;

const productType = computed(() => {
	const product = shopProduct;
	if (product.avatarFrame) {
		return $gettext(`Avatar frame`);
	} else if (product.background) {
		return $gettext(`Background`);
	} else if (product.stickerPack) {
		return $gettext(`Sticker pack`);
	}
	return null;
});

const readableEndsOn = computed(() => {
	const endsOn = shopProduct.ends_on;
	if (!endsOn) {
		return;
	}

	return shorthandReadableTime(endsOn, {
		allowFuture: true,
		precision: 'rough',
		nowText: $gettext(`No longer for sale`),
		timeTransformer(time) {
			return $gettext(`%{ time } left to purchase`, { time });
		},
	});
});

const parentRatio = 1;
const nameFontSize = kFontSizeSmall;
</script>

<template>
	<a
		v-bind="hoverBinding"
		class="theme-dark"
		:style="
			styleTyped({
				borderRadius: kBorderRadiusLg.px,
				position: `relative`,
				backgroundColor: kThemeGray,
				backgroundImage: `radial-gradient(circle at center bottom, rgba(128, 128, 128, 0.75), transparent 69%)`,
				display: `flex`,
				flexDirection: `column`,
				...styleElevate(0),
				...styleWhen(hovered && !disablePurchases, {
					...styleElevate(2),
				}),
				...styleWhen(disablePurchases, {
					cursor: `default`,
				}),
			})
		"
		@click="onClickProduct()"
	>
		<div
			:style="{
				// Only need the pointer to interact with the root item.
				// This should prevent our scale transforms from causing a hover outside of the parent bounds.
				pointerEvents: `none`,
				position: `relative`,
				zIndex: 1,
				padding: `12px`,
				transition: `transform ${kStrongEaseOut} 250ms`,
				...styleWhen(hovered, {
					transform: `translateY(-16px) scale(1.2)`,
				}),
			}"
		>
			<AppAspectRatio
				:ratio="parentRatio"
				:child-ratio="shopProduct.stickerPack ? StickerPackRatio : 1"
				show-overflow
			>
				<AppStickerPack v-if="shopProduct.stickerPack" :pack="shopProduct.stickerPack" />
				<AppUserAvatarBubble
					v-else-if="shopProduct.avatarFrame"
					:user="myUser"
					:frame-override="shopProduct.avatarFrame"
					show-frame
					smoosh
					disable-link
				/>
				<AppBackground
					v-else-if="shopProduct.background"
					:background="shopProduct.background"
					:backdrop-style="{
						borderRadius: kBorderRadiusLg.px,
					}"
					:background-style="{
						backgroundSize: `contain`,
						backgroundPosition: `center`,
					}"
					darken
				>
					<AppAspectRatio :ratio="1" />
				</AppBackground>
			</AppAspectRatio>
		</div>

		<div
			:style="{
				backgroundColor: `black`,
				width: `100%`,
				padding: `8px`,
				display: `flex`,
				flexDirection: `column`,
				alignItems: `center`,
				fontSize: nameFontSize.px,
				color: kThemeFg,
				borderBottomRightRadius: kBorderRadiusLg.px,
				borderBottomLeftRadius: kBorderRadiusLg.px,
				textAlign: `center`,
				flex: `auto`,
			}"
		>
			<div
				v-if="productType"
				:style="{
					alignSelf: `center`,
					color: kThemeFgMuted,
					fontSize: `${nameFontSize.value - 2}px`,
				}"
			>
				{{ productType }}
			</div>

			<div
				v-if="name && name.length"
				:style="{
					fontWeight: 700,
				}"
			>
				{{ name }}
			</div>

			<div :style="{ marginTop: `auto`, height: `4px` }" />

			<AppCurrencyPillList
				:style="{
					alignSelf: `flex-end`,
				}"
				:currencies="shopProduct.validPricingsData"
				direction="row"
				cross-align="flex-end"
				fill-color="bg-offset"
				:gap="4"
			/>
		</div>

		<Transition name="fade">
			<div
				v-if="readableEndsOn && !hovered"
				:style="{
					...StickerPackExpiryStyles,
					zIndex: overlayTagZIndex,
				}"
			>
				{{ readableEndsOn }}
			</div>
		</Transition>

		<AppCollectibleUnlockedRibbon
			v-if="shopProduct.is_product_owned && !hovered"
			:style="{ zIndex: overlayTagZIndex }"
		/>
	</a>
</template>

<style lang="stylus" scoped>
.fade-enter-active
.fade-leave-active
	transition: opacity 200ms

.fade-enter-from
.fade-leave-to
	opacity: 0
</style>
