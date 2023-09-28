<script lang="ts">
import { Ref, computed } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { AvatarFrameModel } from '../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../_common/background/background.model';
import { storeModelList } from '../../../../_common/model/model-store.service';
import { ModelData } from '../../../../_common/model/model.service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { StickerPackModel } from '../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../_common/translate/translate.service';
import { RouteLocationRedirect } from '../../../../utils/router';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import RouteLandingCreators from '../../landing/creators/RouteLandingCreators.vue';
import {
	ShopManagerGroup,
	ShopManagerGroupItem,
	ShopManagerGroupItemType,
	createShopManagerStore,
} from './shop.store';

interface ProductPayload<T extends ShopManagerGroupItem> {
	resources: ModelData<T>[];
	canEditFree?: boolean;
	canEditPremium?: boolean;
	slotAmount?: number;
	// TODO(creator-shops) need amount of published items we can have
	publishAmount?: number;
}

async function _makeSectionPromise<T extends ShopManagerGroupItem>(
	typename: Exclude<ShopManagerGroupItemType, 'Sticker_Pack'> | 'packs'
) {
	let url = `/web/dash/creators/shop`;
	if (typename !== 'packs') {
		url += `/collectibles`;
	}
	url += `/${typename}`;
	return await Api.sendRequest<ProductPayload<T>>(url);
}

async function fetchOverviewData() {
	const [avatarFrames, backgrounds, stickerPacks, stickers] = await Promise.all([
		_makeSectionPromise<AvatarFrameModel>('Avatar_Frame'),
		_makeSectionPromise<BackgroundModel>('Background'),
		_makeSectionPromise<StickerPackModel>('packs'),
		_makeSectionPromise<StickerModel>('Sticker'),
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
const { avatarFrames, backgrounds, stickerPacks, stickers } = createShopManagerStore();

const routeTitle = computed(() => $gettext(`Manage Shop Content`));

function _setGroupFields<T extends ShopManagerGroupItem>(
	group: Ref<ShopManagerGroup<T>>,
	data: ProductPayload<T> | null,
	makeModels: (items: ModelData<T>[]) => T[]
) {
	const { canEditFree, canEditPremium, resources, slotAmount, publishAmount } = data || {
		resources: [],
	};

	const items = makeModels(resources);

	group.value.canAddFree = canEditFree;
	group.value.canAddPremium = canEditPremium;
	group.value.items = items;
	group.value.slotAmount = slotAmount;
	group.value.publishAmount = publishAmount;
}

createAppRoute({
	routeTitle,
	async onResolved(data) {
		const payload = data.payload as Awaited<ReturnType<typeof fetchOverviewData>>;

		_setGroupFields(avatarFrames, payload.avatarFrames, i =>
			storeModelList(AvatarFrameModel, i)
		);
		_setGroupFields(backgrounds, payload.backgrounds, i => storeModelList(BackgroundModel, i));
		_setGroupFields(stickerPacks, payload.stickerPacks, i =>
			storeModelList(StickerPackModel, i)
		);
		_setGroupFields(stickers, payload.stickers, i => storeModelList(StickerModel, i));
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
