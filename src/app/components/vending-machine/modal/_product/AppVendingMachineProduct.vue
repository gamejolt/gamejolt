<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppBackground from '../../../../../_common/background/AppBackground.vue';
import { shorthandReadableTime } from '../../../../../_common/filters/duration';
import { InventoryShopProductSale } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import AppStickerPack, {
	StickerPackExpiryStyles,
} from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppUserAvatarBubble from '../../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { kBorderRadiusLg } from '../../../../../_styles/variables';
import AppProductCurrencyTags from './AppProductCurrencyTags.vue';

const props = defineProps({
	shopProduct: {
		type: Object as PropType<InventoryShopProductSale>,
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
	purchase: (_shopProduct: InventoryShopProductSale) => true,
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
				:expiry-info="shopProduct.ends_on"
				:can-click-pack="!disablePurchases"
				show-details
				@click-pack="onClickProduct()"
			>
				<template #overlay-children>
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

				<div
					v-if="shopProduct.ends_on"
					:style="{
						...StickerPackExpiryStyles,
						zIndex: overlayTagZIndex,
					}"
				>
					{{
						shorthandReadableTime(shopProduct.ends_on, {
							allowFuture: true,
							precision: 'rough',
							nowText: $gettext(`Expired`),
						})
					}}
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