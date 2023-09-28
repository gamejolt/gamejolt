<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { AvatarFrameModel } from '../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../_common/background/background.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import { ShopItemModelCommonFields } from '../../../../../_common/model/shop-item-model.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../_common/sticker/sticker.model';
import { kThemeGjDarkGreen, kThemeGjGreen } from '../../../../../_common/theme/variables';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { styleBorderRadiusLg } from '../../../../../_styles/mixins';
import { assertNever } from '../../../../../utils/utils';
import { ProductType, ShopProductPremiumColor, useShopManagerStore } from '../shop.store';
import FormShopProductAvatarFrame from './_forms/FormShopProductAvatarFrame.vue';
import FormShopProductBackground from './_forms/FormShopProductBackground.vue';
import FormShopProductSticker from './_forms/FormShopProductSticker.vue';
import FormShopProductStickerPack from './_forms/FormShopProductStickerPack.vue';

defineOptions(
	defineAppRouteOptions({
		deps: {
			params: ['type', 'id'],
		},
		// Empty resolver so that the shop store is resolved first.
		resolver: () => Promise.resolve(),
	})
);

const route = useRoute();
const { avatarFrames, backgrounds, stickerPacks, stickers } = useShopManagerStore()!;

const avatarFrame = ref<AvatarFrameModel>();
const background = ref<BackgroundModel>();
const sticker = ref<StickerModel>();
const stickerPack = ref<StickerPackModel>();

const productType = computed(() => route.params.type as ProductType);

const routeTitles: Record<ProductType, string> = {
	'avatar-frame': $gettext(`Avatar frame product`),
	background: $gettext(`Background product`),
	sticker: $gettext(`Sticker product`),
	'sticker-pack': $gettext(`Sticker pack product`),
};

const routeTitle = computed(() => routeTitles[productType.value]);

const { isBootstrapped } = createAppRoute({
	routeTitle,
	onResolved() {
		if (!route.params.id) {
			return;
		}

		const modelId = parseInt(route.params.id as string, 10);

		switch (productType.value) {
			case 'avatar-frame':
				avatarFrame.value = avatarFrames.value.items.find(i => i.id === modelId);
				break;
			case 'background':
				background.value = backgrounds.value.items.find(i => i.id === modelId);
				break;
			case 'sticker-pack':
				stickerPack.value = stickerPacks.value.items.find(i => i.id === modelId);
				break;
			case 'sticker':
				sticker.value = stickers.value.items.find(i => i.id === modelId);
				break;
			default:
				assertNever(productType.value);
		}
	},
});

const item = computed<ShopItemModelCommonFields | undefined>(
	() => avatarFrame.value || background.value || stickerPack.value || sticker.value
);

const headerMessage = computed(() => {
	if (sticker.value) {
		if (sticker.value.is_premium) {
			return $gettext(
				`Premium stickers can be placed into premium sticker packs, which can be sold in your shop.`
			);
		} else {
			return $gettext(`Charge stickers can be placed into charge sticker packs.`);
		}
	} else if (stickerPack.value && !stickerPack.value.is_premium) {
		return $gettext(
			`Charge sticker packs are automatically rewarded to users for placing charged stickers on your content.`
		);
	} else if (item.value?.is_premium) {
		return $gettext(`Premium products are available for purchase in your shop.`);
	}
});
</script>

<template>
	<RouterLink
		class="link-muted"
		:to="{ name: 'dash.shop.overview' }"
		:style="{ display: `block`, padding: `0 16px 16px 0`, marginBottom: `16px` }"
	>
		<AppJolticon icon="arrow-left" middle />
		{{ $gettext(`Back to shop dashboard`) }}
	</RouterLink>

	<!-- Premium/charge tag -->
	<div
		v-if="item"
		:style="[
			styleBorderRadiusLg,
			{
				display: `inline-block`,
				fontWeight: `bold`,
				padding: `2px 6px`,
			},
			item.is_premium
				? {
						backgroundColor: ShopProductPremiumColor,
						color: `black`,
				  }
				: {
						backgroundColor: kThemeGjDarkGreen,
						color: kThemeGjGreen,
				  },
		]"
	>
		<template v-if="!item.is_premium">
			{{ $gettext(`Charge`) }}
		</template>
		<template v-else>
			{{ $gettext(`Premium`) }}
		</template>
	</div>

	<h1 :style="{ margin: `4px 0` }">{{ routeTitle }}</h1>

	<div v-if="headerMessage">
		{{ headerMessage }}
	</div>

	<AppSpacer vertical :scale="6" />

	<template v-if="isBootstrapped">
		<FormShopProductAvatarFrame v-if="productType === 'avatar-frame'" :model="avatarFrame" />
		<FormShopProductBackground v-else-if="productType === 'background'" :model="background" />
		<FormShopProductStickerPack
			v-else-if="productType === 'sticker-pack'"
			:model="stickerPack"
		/>
		<FormShopProductSticker v-else-if="productType === 'sticker'" :model="sticker" />
		<template v-else>
			{{ $gettext(`Uh oh, something went wrong...`) }}
		</template>
	</template>
	<template v-else>
		<AppLoading centered />
	</template>
</template>
