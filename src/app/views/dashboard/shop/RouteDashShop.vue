<script lang="ts">
import { computed } from 'vue';

import AppShellPageBackdrop from '~app/components/shell/AppShellPageBackdrop.vue';
import {
	createShopDashStore,
	populateShopDashStoreGroup,
} from '~app/views/dashboard/shop/shop.store';
import RouteLandingCreators from '~app/views/landing/creators/RouteLandingCreators.vue';
import { Api } from '~common/api/api.service';
import { AvatarFrameModel } from '~common/avatar/frame.model';
import { BackgroundModel } from '~common/background/background.model';
import { CreatorChangeRequestModel } from '~common/creator/change-request/creator-change-request.model';
import { storeModelList } from '~common/model/model-store.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { ShopProductResource } from '~common/shop/product/product-model';
import {
	ShopProductResourceAvatarFrame,
	ShopProductResourceBackground,
	ShopProductResourceSticker,
	ShopProductResourceStickerPack,
} from '~common/shop/product/product-model';
import { StickerPackModel } from '~common/sticker/pack/pack.model';
import { StickerModel } from '~common/sticker/sticker.model';
import { $gettext } from '~common/translate/translate.service';
import { RouteLocationRedirect } from '~utils/router';

async function _makeSectionPromise(
	resource: Exclude<ShopProductResource, typeof ShopProductResourceStickerPack> | 'packs'
) {
	let url = `/web/dash/creators/shop`;
	if (resource !== 'packs') {
		url += `/collectibles`;
	}
	url += `/${resource}`;
	return await Api.sendRequest(url);
}

async function fetchOverviewData() {
	const [avatarFrames, backgrounds, stickerPacks, stickers] = await Promise.all([
		_makeSectionPromise(ShopProductResourceAvatarFrame),
		_makeSectionPromise(ShopProductResourceBackground),
		_makeSectionPromise('packs'),
		_makeSectionPromise(ShopProductResourceSticker),
	]);

	return {
		avatarFrames,
		backgrounds,
		stickerPacks,
		stickers,
	};
}

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		resolver: async () => {
			try {
				return await fetchOverviewData();
			} catch (error) {
				// Redirect away if the request fails.
				return new RouteLocationRedirect({
					name: RouteLandingCreators.name,
				});
			}
		},
	}),
};
</script>

<script lang="ts" setup>
const store = createShopDashStore();
const { avatarFrames, backgrounds, stickerPacks, stickers } = store;

const routeTitle = computed(() => $gettext(`Manage Shop Content`));

createAppRoute({
	routeTitle,
	async onResolved(data) {
		const payload = data.payload as Awaited<ReturnType<typeof fetchOverviewData>>;

		(
			[
				[AvatarFrameModel, avatarFrames.value, payload.avatarFrames],
				[BackgroundModel, backgrounds.value, payload.backgrounds],
				[StickerPackModel, stickerPacks.value, payload.stickerPacks],
				[StickerModel, stickers.value, payload.stickers],
			] as const
		).forEach(([modelConstructor, group, groupPayload]) => {
			populateShopDashStoreGroup(
				store,
				group,
				{
					...groupPayload,
					changeRequests: groupPayload.changeRequests
						? storeModelList(CreatorChangeRequestModel, groupPayload.changeRequests)
						: [],
				},
				storeModelList(modelConstructor as any, groupPayload.resources)
			);
		});
	},
});
</script>

<template>
	<AppShellPageBackdrop>
		<section class="section">
			<div class="container">
				<RouterView />
			</div>
		</section>
	</AppShellPageBackdrop>
</template>
