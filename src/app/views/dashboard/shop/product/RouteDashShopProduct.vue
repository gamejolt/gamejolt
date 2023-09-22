<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { AvatarFrameModel } from '../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../_common/background/background.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { assertNever } from '../../../../../utils/utils';
import { ProductType, useShopManagerStore } from '../shop.store';
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

	<h1 class="section-header">{{ routeTitle }}</h1>

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
