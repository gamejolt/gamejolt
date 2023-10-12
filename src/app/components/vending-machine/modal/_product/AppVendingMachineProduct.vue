<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import { ShopClickType, trackShopClick } from '../../../../../_common/analytics/analytics.service';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppBackground from '../../../../../_common/background/AppBackground.vue';
import { shorthandReadableTime } from '../../../../../_common/filters/duration';
import { InventoryShopProductSaleModel } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import AppStickerPack, {
	StickerPackExpiryStyles,
} from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { kBorderRadiusLg } from '../../../../../_styles/variables';
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

const name = computed(() => {
	const product = shopProduct.value;
	if (product.stickerPack) {
		// This is handled in the AppStickerPack component.
		return null;
	} else if (product.avatarFrame) {
		return product.avatarFrame.name || '';
	} else if (product.background) {
		return product.background.name || '';
	}

	return null;
});

function onClickProduct() {
	if (disablePurchases.value) {
		return;
	}

	let type: ShopClickType = 'unhandled-product';
	const i = shopProduct.value;
	if (i.avatarFrame) {
		type = 'avatar-frame';
	} else if (i.background) {
		type = 'background';
	} else if (i.stickerPack) {
		type = 'sticker-pack';
	}

	trackShopClick({ type });
	emit('purchase', shopProduct.value);
}

const popperConfirmRadius = kBorderRadiusLg;

const overlayTagZIndex = 2;
const currencyTagStyles: CSSProperties = {
	position: `absolute`,
	bottom: `4px`,
	right: `4px`,
	zIndex: overlayTagZIndex,
};

const anchorStyles = computed<CSSProperties>(() => {
	if (disablePurchases.value) {
		// Revert the cursor if we're not allowing purchases. Using a
		// <component> tag and swapping between <a> and <div> was causing some
		// item images to flicker.
		return { cursor: `inherit` };
	}
	return {};
});

const readableEndsOnStyles: CSSProperties = {
	...StickerPackExpiryStyles,
	zIndex: overlayTagZIndex,
};

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
</script>

<template>
	<div>
		<div
			:style="{
				position: `relative`,
				zIndex: 1,
			}"
		>
			<AppStickerPack
				v-if="shopProduct.stickerPack"
				:pack="shopProduct.stickerPack"
				:can-click-pack="!disablePurchases"
				show-details
				@click-pack="onClickProduct()"
			>
				<template #overlay-children>
					<div v-if="readableEndsOn" :style="readableEndsOnStyles">
						{{ readableEndsOn }}
					</div>

					<AppProductCurrencyTags
						:style="currencyTagStyles"
						:shop-product="shopProduct"
					/>
				</template>
			</AppStickerPack>
			<a v-else-if="shopProduct.product" :style="anchorStyles" @click="onClickProduct()">
				<AppUserAvatarBubble
					v-if="shopProduct.avatarFrame"
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

				<div v-if="readableEndsOn" :style="readableEndsOnStyles">
					{{ readableEndsOn }}
				</div>

				<AppProductCurrencyTags :style="currencyTagStyles" :shop-product="shopProduct" />
			</a>
		</div>

		<div
			v-if="name && name.length"
			:style="{
				marginTop: `8px`,
				fontWeight: 700,
			}"
		>
			{{ name }}
		</div>
	</div>
</template>
