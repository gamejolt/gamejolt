<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { AvatarFrameModel } from '../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../_common/background/background.model';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { assertNever } from '../../../../../utils/utils';
import { useShopManagerStore } from '../RouteDashShop.vue';
import FormShopProductAvatarFrame from './_forms/FormShopProductAvatarFrame.vue';
import FormShopProductSticker from './_forms/FormShopProductSticker.vue';

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
const { avatarFrames, backgrounds, stickers, stickerPacks } = useShopManagerStore()!;

const avatarFrame = ref<AvatarFrameModel>();
const background = ref<BackgroundModel>();
const sticker = ref<StickerModel>();
const stickerPack = ref<StickerPackModel>();

type ProductType = 'avatar-frame' | 'background' | 'sticker' | 'sticker-pack';

const productType = computed(() => route.params.type as ProductType);

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() => {
		const titles: Record<ProductType, string> = {
			'avatar-frame': $gettext(`Avatar frame product`),
			background: $gettext(`Background product`),
			sticker: $gettext(`Sticker product`),
			'sticker-pack': $gettext(`Sticker pack product`),
		};

		return titles[productType.value];
	}),
	onResolved() {
		if (!route.params.id) {
			return;
		}

		const modelId = parseInt(route.params.id as string, 10);

		switch (productType.value) {
			case 'avatar-frame': {
				avatarFrame.value = avatarFrames.value.items.find(i => i.id === modelId);
				break;
			}

			case 'background': {
				background.value = backgrounds.value.items.find(i => i.id === modelId);
				break;
			}

			case 'sticker': {
				sticker.value = stickers.value.items.find(i => i.id === modelId);
				break;
			}

			case 'sticker-pack': {
				stickerPack.value = stickerPacks.value.items.find(i => i.id === modelId);
				break;
			}

			default:
				assertNever(productType.value);
		}
	},
});
</script>

<template>
	<template v-if="isBootstrapped">
		<FormShopProductAvatarFrame v-if="productType === 'avatar-frame'" :model="avatarFrame" />
		<FormShopProductSticker v-else-if="productType === 'sticker'" :model="sticker" />
		<template v-else>
			{{ $gettext(`Uh oh`) }}
		</template>
	</template>
	<template v-else>
		<AppLoading centered />
	</template>
</template>
