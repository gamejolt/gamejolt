<script lang="ts" setup>
import { PropType, computed, toRef, toRefs } from 'vue';
import { ShopViewType, trackShopView } from '../../../../../_common/analytics/analytics.service';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppBackground from '../../../../../_common/background/AppBackground.vue';
import { shorthandReadableTime } from '../../../../../_common/filters/duration';
import { InventoryShopProductSaleModel } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import { useOnHover } from '../../../../../_common/on/useOnHover';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppStickerPack, {
	StickerPackExpiryStyles,
	StickerPackRatio,
} from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { kThemeFg, kThemeFgMuted, kThemeGray } from '../../../../../_common/theme/variables';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleElevate, styleTyped, styleWhen } from '../../../../../_styles/mixins';
import { kBorderRadiusLg, kFontSizeSmall, kStrongEaseOut } from '../../../../../_styles/variables';
import AppProductCurrencyTags from './AppProductCurrencyTags.vue';

const props = defineProps({
	shopProduct: {
		type: Object as PropType<InventoryShopProductSaleModel>,
		required: true,
	},
	/**
	 * Used to prevent further purchases while we're processing one.
	 */
	disablePurchases: {
		type: Boolean,
	},
});

const { shopProduct, disablePurchases } = toRefs(props);

const emit = defineEmits({
	purchase: (_shopProduct: InventoryShopProductSaleModel) => true,
});

const { user: myUser } = useCommonStore();

const name = computed(() => shopProduct.value.product?.name || '');

const { hoverBinding, hovered } = useOnHover({
	disable: toRef(() => !Screen.isPointerMouse),
});

function onClickProduct() {
	if (disablePurchases.value) {
		return;
	}

	let type: ShopViewType = 'unhandled-product';
	const i = shopProduct.value;
	if (i.avatarFrame) {
		type = 'avatar-frame';
	} else if (i.background) {
		type = 'background';
	} else if (i.stickerPack) {
		type = 'sticker-pack';
	}

	trackShopView({ type });
	emit('purchase', shopProduct.value);
}

const popperConfirmRadius = kBorderRadiusLg;

const overlayTagZIndex = 2;

const productType = computed(() => {
	const product = shopProduct.value;
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
	const endsOn = shopProduct.value.ends_on;
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

const parentRatio = 1 ?? (1 + StickerPackRatio) / 2;
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
				...styleElevate(0),
				...styleWhen(hovered && !disablePurchases, styleElevate(2)),
				backgroundColor: kThemeGray,
				backgroundImage: `radial-gradient(circle at center bottom, rgba(128, 128, 128, 0.75), transparent 69%)`,
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
				<AppAspectRatio v-else-if="shopProduct.background" :ratio="1">
					<AppBackground
						:background="shopProduct.background"
						:backdrop-style="{
							borderRadius: popperConfirmRadius.px,
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
			}"
		>
			<div
				v-if="name && name.length"
				:style="{
					textAlign: `right`,
					fontWeight: 700,
				}"
			>
				{{ name }}
			</div>

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

			<AppProductCurrencyTags
				:style="{
					marginTop: `4px`,
					alignSelf: `flex-end`,
				}"
				:shop-product="shopProduct"
				fill-color="bg-offset"
				direction="row"
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
