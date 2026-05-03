<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import FormShopProductAvatarFrame from '~app/views/dashboard/shop/product/_forms/FormShopProductAvatarFrame.vue';
import FormShopProductBackground from '~app/views/dashboard/shop/product/_forms/FormShopProductBackground.vue';
import FormShopProductSticker from '~app/views/dashboard/shop/product/_forms/FormShopProductSticker.vue';
import FormShopProductStickerPack from '~app/views/dashboard/shop/product/_forms/FormShopProductStickerPack.vue';
import {
	getShopDashProductResourceFromParam,
	ShopDashProductResourceParam,
	useShopDashStore,
} from '~app/views/dashboard/shop/shop.store';
import { AvatarFrameModel } from '~common/avatar/frame.model';
import { BackgroundModel } from '~common/background/background.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLoading from '~common/loading/AppLoading.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import {
	ShopProductResourceAvatarFrame,
	ShopProductResourceBackground,
	ShopProductResourceSticker,
	ShopProductResourceStickerPack,
} from '~common/shop/product/product-model';
import { StickerPackModel } from '~common/sticker/pack/pack.model';
import { StickerModel } from '~common/sticker/sticker.model';
import { $gettext } from '~common/translate/translate.service';

defineOptions(
	defineAppRouteOptions({
		reloadOn: {
			params: ['resource', 'id'],
		},
		// Empty resolver so that the shop store is resolved first.
		resolver: () => Promise.resolve(),
	})
);

const route = useRoute();
const router = useRouter();
const { avatarFrames, backgrounds, stickerPacks, stickers } = useShopDashStore()!;

const avatarFrame = ref<AvatarFrameModel>();
const background = ref<BackgroundModel>();
const sticker = ref<StickerModel>();
const stickerPack = ref<StickerPackModel>();

const resource = computed(() =>
	getShopDashProductResourceFromParam(
		router.currentRoute.value.params.resource as ShopDashProductResourceParam
	)
);

const routeTitles = {
	[ShopProductResourceAvatarFrame]: $gettext(`Avatar frame product`),
	[ShopProductResourceBackground]: $gettext(`Background product`),
	[ShopProductResourceSticker]: $gettext(`Sticker product`),
	[ShopProductResourceStickerPack]: $gettext(`Sticker pack product`),
};

const routeTitle = computed(() => (resource.value ? routeTitles[resource.value] : ''));

const { isBootstrapped } = createAppRoute({
	routeTitle,
	onResolved() {
		if (!route.params.id) {
			return;
		}

		const modelId = parseInt(route.params.id as string, 10);

		switch (resource.value) {
			case ShopProductResourceAvatarFrame:
				avatarFrame.value = avatarFrames.value.items.find(i => i.id === modelId);
				break;
			case ShopProductResourceBackground:
				background.value = backgrounds.value.items.find(i => i.id === modelId);
				break;
			case ShopProductResourceStickerPack:
				stickerPack.value = stickerPacks.value.items.find(i => i.id === modelId);
				break;
			case ShopProductResourceSticker:
				sticker.value = stickers.value.items.find(i => i.id === modelId);
				break;
		}
	},
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

	<template v-if="isBootstrapped">
		<FormShopProductAvatarFrame
			v-if="resource === ShopProductResourceAvatarFrame"
			:model="avatarFrame"
		/>
		<FormShopProductBackground
			v-else-if="resource === ShopProductResourceBackground"
			:model="background"
		/>
		<FormShopProductStickerPack
			v-else-if="resource === ShopProductResourceStickerPack"
			:model="stickerPack"
		/>
		<FormShopProductSticker
			v-else-if="resource === ShopProductResourceSticker"
			:model="sticker"
		/>
		<template v-else>
			{{ $gettext(`Uh oh, something went wrong...`) }}
		</template>
	</template>
	<template v-else>
		<AppLoading centered />
	</template>
</template>
