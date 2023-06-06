<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRefs } from 'vue';
import AppAspectRatio from '../../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppBackground from '../../../../../_common/background/AppBackground.vue';
import { InventoryShopProductSale } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import AppStickerPack from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { styleOverlayTextShadow } from '../../../../../_styles/mixins';
import { kBorderRadiusLg } from '../../../../../_styles/variables';
import AppUserAvatarBubble from '../../../user/AppUserAvatarBubble.vue';
import AppProductCurrencyTags from './AppProductCurrencyTags.vue';

const props = defineProps({
	shopProduct: {
		type: Object as PropType<InventoryShopProductSale>,
		required: true,
	},
	/**
	 * Whether or not the user has enough funds to purchase this product.
	 */
	canPurchase: {
		type: Boolean,
		required: true,
	},
	/**
	 * Used to prevent further purchases while we're processing one.
	 */
	disablePurchases: {
		type: Boolean,
	},
});

const { shopProduct, canPurchase, disablePurchases } = toRefs(props);

const emit = defineEmits({
	purchase: (_shopProduct: InventoryShopProductSale) => true,
});

const { user: myUser } = useCommonStore();

const canPerformAction = computed(() => !disablePurchases.value && canPurchase.value);

function onClickProduct() {
	if (!canPerformAction.value) {
		return;
	}

	emit('purchase', shopProduct.value);
}

const popperConfirmRadius = kBorderRadiusLg;

const notEnoughFundsOverlayStyles: CSSProperties = {
	...styleOverlayTextShadow,
	borderRadius: popperConfirmRadius.px,
	position: `absolute`,
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
	fontSize: `13px`,
	padding: `12px`,
	zIndex: 2,
	display: `grid`,
	justifyContent: `center`,
	alignContent: `center`,
	textAlign: `center`,
	fontWeight: `bold`,
	color: `white`,
	backgroundColor: `rgba(0, 0, 0, 0.45)`,
};

const currencyTagStyles: CSSProperties = {
	position: `absolute`,
	bottom: `4px`,
	right: `4px`,
};
</script>

<template>
	<div
		:style="{
			position: `relative`,
		}"
	>
		<template v-if="shopProduct.stickerPack">
			<AppStickerPack
				:pack="shopProduct.stickerPack"
				:expiry-info="shopProduct.ends_on"
				:can-click-pack="canPerformAction"
				show-details
				@click-pack="onClickProduct()"
			>
				<template #overlay-children>
					<AppProductCurrencyTags
						:style="currencyTagStyles"
						:shop-product="shopProduct"
					/>

					<div v-if="!canPurchase" :style="notEnoughFundsOverlayStyles">
						{{ $gettext(`You don't have enough funds to purchase this`) }}
					</div>
				</template>
			</AppStickerPack>
		</template>
		<template v-else-if="shopProduct.avatarFrame">
			<component :is="canPerformAction ? 'a' : 'div'" @click="onClickProduct()">
				<AppUserAvatarBubble
					:user="myUser"
					:frame-override="shopProduct.avatarFrame"
					show-frame
					smoosh
					disable-link
				/>

				<AppProductCurrencyTags :style="currencyTagStyles" :shop-product="shopProduct" />

				<div v-if="!canPurchase" :style="notEnoughFundsOverlayStyles">
					{{ $gettext(`You don't have enough funds to purchase this`) }}
				</div>
			</component>
		</template>
		<template v-else-if="shopProduct.background">
			<component :is="canPerformAction ? 'a' : 'div'" @click="onClickProduct()">
				<AppAspectRatio :ratio="1">
					<AppBackground
						:background="shopProduct.background"
						:background-style="{
							borderRadius: popperConfirmRadius.px,
						}"
						darken
					>
						<AppAspectRatio :ratio="1" />
					</AppBackground>
				</AppAspectRatio>

				<AppProductCurrencyTags :style="currencyTagStyles" :shop-product="shopProduct" />

				<div v-if="!canPurchase" :style="notEnoughFundsOverlayStyles">
					{{ $gettext(`You don't have enough funds to purchase this`) }}
				</div>
			</component>
		</template>
	</div>
</template>
