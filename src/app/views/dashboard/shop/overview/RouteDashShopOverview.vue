<script lang="ts">
import { CSSProperties, Ref, computed, ref } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import { AvatarFrameModel } from '../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../_common/background/background.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { storeModelList } from '../../../../../_common/model/model-store.service';
import { ModelData } from '../../../../../_common/model/model.service';
import {
createAppRoute,
defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { StickerPackRatio } from '../../../../../_common/sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { StickerModel } from '../../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { touchUser } from '../../../../../_common/user/user.model';
import { kBorderRadiusLg, kBorderWidthBase, kFontSizeBase } from '../../../../../_styles/variables';
import AppDashShopHover from '.././AppDashShopHover.vue';
import AppDashShopItem from '.././AppDashShopItem.vue';
import AppDashShopItemAdd from '../AppDashShopItemAdd.vue';
import { ShopItemStates } from '../AppDashShopItemBase.vue';
import {
ShopManagerGroup,
ShopManagerGroupItem,
ShopManagerGroupItemType,
useShopManagerStore,
} from '../RouteDashShop.vue';
import { ShopChangesType, showManageShopChangesModal } from '../_changes-modal/modal.service';

interface ProductPayload<T extends ShopManagerGroupItem> {
	resources: ModelData<T>[];
	// TODO(creator-shops) need amount of publish items we can have
	slotAmount?: number;
	allowedToAdd?: boolean;
}

async function _makeSectionPromise<T extends ShopManagerGroupItem>(
	typename: ShopManagerGroupItemType,
	{ premium = true }: { premium?: boolean } = {}
) {
	let url = `/web/dash/creators/shop/collectibles/${typename}?premium=${!!premium}`;
	return await Api.sendRequest<ProductPayload<T>>(url, undefined, { detach: true }).catch(e => {
		console.error(`Error with promise for typename: [${typename}].`, e);
		return null;
	});
}

async function getOverviewData() {
	// TODO(creator-shops) remove
	const unsafe = false;
	const promises = Promise.all([
		_makeSectionPromise<AvatarFrameModel>('Avatar_Frame'),
		_makeSectionPromise<BackgroundModel>('Background'),
		unsafe ? _makeSectionPromise<StickerPackModel>('Sticker_Pack') : null,
		_makeSectionPromise<StickerModel>('Sticker'),
		unsafe ? _makeSectionPromise<StickerPackModel>('Sticker_Pack', { premium: false }) : null,
		unsafe ? _makeSectionPromise<StickerModel>('Sticker', { premium: false }) : null,
	]);

	const [
		avatarFrames,
		backgrounds,
		stickerPacks,
		stickers,
		freemiumStickerPacks,
		freemiumStickers,
	] = await promises;

	return {
		avatarFrames,
		backgrounds,
		stickerPacks,
		stickers,
		freemiumStickerPacks,
		freemiumStickers,
	};
}

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => touchUser(),
	}),
};
</script>

<script lang="ts" setup>
interface ChangeData {
	items: ShopManagerGroupItem[];
	count: number;
}

const routeTitle = computed(() => $gettext(`Manage Shop Content`));

const controller = useShopManagerStore()!;
const { avatarFrames, backgrounds, stickerPacks, stickers, changes } = controller;

// AppRoute sets isBootstrapped to `true` without awaiting [onResolved] calls,
// so we can just set it ourselves when we're done with the busy work.
const isBootstrapped = ref(false);

createAppRoute({
	routeTitle,
	async onResolved({ fromCache }) {
		// TODO(creator-shops) Should we fetch this fresh every time?
		if (fromCache) {
			isBootstrapped.value = true;
			return;
		}

		try {
			const payload = await getOverviewData();

			_setGroupFields(avatarFrames, payload.avatarFrames, i =>
				storeModelList(AvatarFrameModel, i)
			);
			_setGroupFields(backgrounds, payload.backgrounds, i =>
				storeModelList(BackgroundModel, i)
			);
			_setGroupFields(stickerPacks, payload.stickerPacks, i =>
				storeModelList(StickerPackModel, i)
			);
			_setGroupFields(stickers, payload.stickers, i => storeModelList(StickerModel, i));
		} catch (e) {
			console.error('Error fetching overview data', e);
		}

		isBootstrapped.value = true;
	},
});

function _setGroupFields<T extends ShopManagerGroupItem>(
	group: Ref<ShopManagerGroup<T>>,
	data: ProductPayload<T> | null,
	makeModels: (items: ModelData<T>[]) => T[]
) {
	const { allowedToAdd, resources, slotAmount } = data ?? {
		allowedToAdd: true,
		resources: [],
		// slotAmount: 30,
	};

	group.value.canAdd = allowedToAdd;
	group.value.itemCount = resources?.length;
	group.value.items = makeModels(resources);
	// group.value.maxPublished = publishedAmount;
	group.value.slotAmount = slotAmount;
}

const actionWells = computed(() => {
	const items: {
		label: string;
		manageType: ShopChangesType;
		data: ChangeData;
	}[] = [];

	const { approved, inReview, rejected, draft } = changes;

	if (approved.value.count || approved.value.items.length) {
		items.push({
			manageType: 'approved',
			label: $gettext(`You have approved items you can submit`),
			data: approved.value,
		});
	}

	if (inReview.value.count || inReview.value.items.length) {
		items.push({
			manageType: 'inReview',
			label: $gettext(`You have items in review`),
			data: inReview.value,
		});
	}

	if (rejected.value.count || rejected.value.items.length) {
		items.push({
			manageType: 'rejected',
			label: $gettext(`You have rejected items`),
			data: rejected.value,
		});
	}

	if (draft.value.ids.size) {
		items.push({
			manageType: 'draft',
			label: $gettext(`You have changes waiting to be submitted`),
			data: {
				items: [],
				count: draft.value.ids.size,
			},
		});
	}

	return items;
});

const sectionData = computed<
	{
		typename: ShopManagerGroupItemType;
		premium: boolean;
		label: string;
		data: ShopManagerGroup;
		canAdd?: boolean;
		ratio: number;
	}[]
>(() => {
	return [
		{
			typename: `Avatar_Frame`,
			premium: true,
			label: $gettext(`Avatar frames`),
			data: avatarFrames.value,
			canAdd: avatarFrames.value.canAdd,
			ratio: 1,
		},
		{
			typename: `Background`,
			premium: true,
			label: $gettext(`Backgrounds`),
			data: backgrounds.value,
			canAdd: backgrounds.value.canAdd,
			ratio: 1,
		},
		{
			typename: `Sticker_Pack`,
			premium: true,
			label: $gettext(`Sticker packs`),
			data: stickerPacks.value,
			canAdd: stickerPacks.value.canAdd,
			ratio: StickerPackRatio,
		},
		{
			typename: `Sticker`,
			premium: true,
			label: $gettext(`Stickers`),
			data: stickers.value,
			canAdd: stickers.value.canAdd,
			ratio: 1,
		},
		{
			typename: `Sticker_Pack`,
			premium: false,
			label: $gettext(`Sticker packs (non-premium)`),
			data: stickerPacks.value,
			canAdd: stickerPacks.value.canAdd,
			ratio: StickerPackRatio,
		},
		{
			typename: `Sticker`,
			premium: false,
			label: $gettext(`Stickers (non-premium)`),
			data: stickers.value,
			canAdd: stickers.value.canAdd,
			ratio: 1,
		},
	];
});

function getItemStates(item: ShopManagerGroupItem): ShopItemStates {
	// TODO(creator-shops) item states
	return {
		active: item.has_active_sale,
		// draft: true,
		// inReview: true,
		// rejected: true,
	};
}

function onClickActionWell(manageType: ShopChangesType) {
	return showManageShopChangesModal({
		controller,
		manageType,
	});
}

const headerStyles: CSSProperties = {
	marginTop: 0,
	// marginBottom: 0,
};

const subheaderStyles: CSSProperties = {
	marginTop: 0,
	marginBottom: 0,
};

const helpBlockStyles: CSSProperties = {
	marginTop: `4px`,
};

const gridStyles: CSSProperties = {
	display: `grid`,
	gridTemplateColumns: `repeat(auto-fill, minmax(120px, 1fr))`,
	gap: `16px`,
	marginBottom: `32px`,
};

const itemBorderWidth = kBorderWidthBase.value;
const itemBorderRadius = kBorderRadiusLg.value;
</script>

<template>
	<AppLoadingFade :is-loading="!isBootstrapped">
		<div>
			<h1 :style="headerStyles">
				{{ $gettext(`Shop products`) }}
			</h1>

			<div class="help-block" :style="helpBlockStyles">
				<p>
					{{
						$gettext(
							`These are your shop products. You can submit and swap out active items to sell in the Content Shop. Some changes may require an approval process.`
						)
					}}
				</p>
			</div>

			<!-- TODO(creator-shops) figure this out -->
			<template v-for="{ label, data, manageType } in actionWells" :key="label">
				<AppDashShopHover
					:padding-v="12"
					:padding-h="16"
					:style="{ marginBottom: `8px` }"
					no-scale
					@click="onClickActionWell(manageType)"
				>
					<div
						:style="{
							width: `100%`,
							display: `flex`,
							alignItems: `center`,
							justifyContent: `space-between`,
						}"
					>
						{{ label }}

						<AppJolticon
							icon="arrow-right"
							:style="{
								margin: 0,
								color: `inherit`,
								opacity: 0.75,
								fontSize: kFontSizeBase.px,
							}"
						/>
					</div>
				</AppDashShopHover>
			</template>

			<AppSpacer vertical :scale="4" />

			<div
				v-for="{ label, typename, premium, data, ratio, canAdd } of sectionData"
				:key="label"
			>
				<h4 :style="subheaderStyles">
					{{ label }}
				</h4>

				<div
					v-if="data.slotAmount || data.maxPublished"
					class="help-block"
					:style="helpBlockStyles"
				>
					<p>
						<template v-if="data.slotAmount">
							<!-- // TODO(creator-shops) remove these fallback values and make the itemCount/activeCount strict if we're doing pagination -->
							{{ data.itemCount ?? data.items.length }}
							{{ ' / ' }}
							{{ data.slotAmount }}
							{{ ' ' }}
							{{ $gettext(`slots used`) }}
						</template>

						<br v-if="data.slotAmount && data.maxPublished" />

						<template v-if="data.maxPublished">
							{{ '??' /* data.activeIds.length */ }}
							{{ ' / ' }}
							{{ data.maxPublished }}
							{{ ' ' }}
							{{ $gettext(`published`) }}
						</template>
					</p>
				</div>

				<div :style="gridStyles">
					<AppDashShopItemAdd
						v-if="canAdd"
						key="add-item"
						:typename="typename"
						:premium="premium"
						:ratio="ratio"
						:border-radius="itemBorderRadius"
						:border-width="itemBorderWidth"
					/>

					<AppDashShopItem
						v-for="item in data.items"
						:key="item.id"
						:item="item"
						:border-radius="itemBorderRadius"
						:border-width="itemBorderWidth"
						:item-states="getItemStates(item)"
					/>
				</div>
			</div>
		</div>
	</AppLoadingFade>
</template>
