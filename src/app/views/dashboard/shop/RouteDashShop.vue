<script lang="ts">
import { computed } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { AvatarFrameModel } from '../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../_common/background/background.model';
import { CreatorChangeRequestModel } from '../../../../_common/creator/change-request/creator-change-request.model';
import { storeModelList } from '../../../../_common/model/model-store.service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { ShopProductResource } from '../../../../_common/shop/product/product-model';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../_common/translate/translate.service';
import { RouteLocationRedirect } from '../../../../utils/router';
import RouteLandingCreators from '../../landing/creators/RouteLandingCreators.vue';
import { createShopDashStore, populateShopDashStoreGroup } from './shop.store';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';

async function _makeSectionPromise(
	resource: Exclude<ShopProductResource, ShopProductResource.StickerPack> | 'packs'
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
		_makeSectionPromise(ShopProductResource.AvatarFrame),
		_makeSectionPromise(ShopProductResource.Background),
		_makeSectionPromise('packs'),
		_makeSectionPromise(ShopProductResource.Sticker),
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
		deps: {},
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
