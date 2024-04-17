<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AvatarFrameModel } from '../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../_common/background/background.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { ShopProductResource } from '../../../../../_common/shop/product/product-model';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import {
	ShopDashProductResourceParam,
	getShopDashProductResourceFromParam,
	useShopDashStore,
} from '../shop.store';
import FormShopProductAvatarFrame from './_forms/FormShopProductAvatarFrame.vue';
import FormShopProductBackground from './_forms/FormShopProductBackground.vue';
import FormShopProductSticker from './_forms/FormShopProductSticker.vue';
import FormShopProductStickerPack from './_forms/FormShopProductStickerPack.vue';

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
	[ShopProductResource.AvatarFrame]: $gettext(`Avatar frame product`),
	[ShopProductResource.Background]: $gettext(`Background product`),
	[ShopProductResource.Sticker]: $gettext(`Sticker product`),
	[ShopProductResource.StickerPack]: $gettext(`Sticker pack product`),
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
			case ShopProductResource.AvatarFrame:
				avatarFrame.value = avatarFrames.value.items.find(i => i.id === modelId);
				break;
			case ShopProductResource.Background:
				background.value = backgrounds.value.items.find(i => i.id === modelId);
				break;
			case ShopProductResource.StickerPack:
				stickerPack.value = stickerPacks.value.items.find(i => i.id === modelId);
				break;
			case ShopProductResource.Sticker:
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
			v-if="resource === ShopProductResource.AvatarFrame"
			:model="avatarFrame"
		/>
		<FormShopProductBackground
			v-else-if="resource === ShopProductResource.Background"
			:model="background"
		/>
		<FormShopProductStickerPack
			v-else-if="resource === ShopProductResource.StickerPack"
			:model="stickerPack"
		/>
		<FormShopProductSticker
			v-else-if="resource === ShopProductResource.Sticker"
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
