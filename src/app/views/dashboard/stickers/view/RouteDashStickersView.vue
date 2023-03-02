<script lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import AppStickerCard from '../../../../../_common/sticker/card/AppStickerCard.vue';
import AppStickerChargeCard from '../../../../../_common/sticker/charge/AppStickerChargeCard.vue';
import { getStickerCountsFromPayloadData } from '../../../../../_common/sticker/sticker-store';
import { StickerStack } from '../../../../../_common/sticker/sticker.model';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { useGridStore } from '../../../../components/grid/grid-store';
import AppPageHeader from '../../../../components/page-header/AppPageHeader.vue';
import backgroundImage from './background.png';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => Api.sendRequest('/web/stickers/dash'),
	}),
};

type InitPayload = {
	stickerCounts: StickerCountPayload[];
	stickers: any[];
	newStickerIds: number[];
};

type StickerCountPayload = {
	sticker_id: number;
	count: number;
};
</script>

<script lang="ts" setup>
const { grid } = useGridStore();

const generalStickers = ref<StickerStack[]>([]);
const eventStickers = ref<StickerStack[]>([]);
const newStickerIds = ref<number[]>([]);

const routeTitle = computed(() => {
	return $gettext(`Your Stickers`);
});

const hasStickersInCollection = computed(() => {
	return generalStickers.value.length > 0 || eventStickers.value.length > 0;
});

const coverMediaItem = computed(() => {
	// Create fake media item resource to pass into the page header.
	return new MediaItem({
		is_animated: false,
		width: 1240,
		height: 409,
		img_url: backgroundImage,
		mediaserver_url: backgroundImage,
	});
});

createAppRoute({
	routeTitle,
	onResolved(data: any) {
		const payload: InitPayload = data.payload;

		const newStickers = getStickerCountsFromPayloadData({
			stickerCounts: payload.stickerCounts,
			stickers: payload.stickers,
			newStickerIds: payload.newStickerIds,
		});

		newStickerIds.value = payload.newStickerIds;
		eventStickers.value = newStickers[0];
		generalStickers.value = newStickers[1];

		grid.value?.pushViewNotifications('stickers');
	},
});
</script>

<template>
	<div class="route-dash-stickers">
		<AppPageHeader :cover-media-item="coverMediaItem" :cover-max-height="250">
			<RouterLink :to="{ name: 'dash.stickers' }">
				<h1 class="section-header sans-margin-bottom">
					{{ $gettext(`Your Stickers`) }}
				</h1>
			</RouterLink>
			<div class="text-muted small">
				<p>
					{{ $gettext(`Marvel at your collection of beautiful stickers.`) }}
				</p>
			</div>
		</AppPageHeader>

		<section class="section">
			<div class="container">
				<div class="row">
					<div class="col-md-4 col-md-push-8">
						<AppStickerChargeCard
							allow-fully-charged-text
							:padding-h="24"
							:padding-v="24"
						/>

						<AppSpacer vertical :scale="6" />
					</div>

					<div class="col-md-8 col-md-pull-4">
						<template v-if="hasStickersInCollection">
							<template
								v-for="(list, i) in [eventStickers, generalStickers]"
								:key="i"
							>
								<template v-if="list.length > 0">
									<p class="-collection-title">
										<span v-if="i === 0">
											{{ $gettext(`Event stickers`) }}
										</span>
										<span v-else-if="i === 1">
											{{ $gettext(`General stickers`) }}
										</span>
									</p>
									<div class="-collection">
										<AppStickerCard
											v-for="stickerCount of list"
											:key="stickerCount.sticker_id"
											:sticker="stickerCount.sticker"
											:label="`x${stickerCount.count}`"
											:is-new="
												newStickerIds.includes(stickerCount.sticker_id)
											"
										/>
									</div>
								</template>
							</template>
						</template>
						<p v-else>
							{{ $gettext(`You don't have any stickers yet.`) }}
						</p>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../../../../_common/sticker/card/variables'

.route-dash-stickers
	change-bg(bg-offset)

.-collection
	display: grid
	grid-template-columns: repeat(auto-fill, $card-width)
	justify-content: space-between
	grid-gap: $card-margin * 2

.-collection-title
	text-transform: uppercase
	color: var(--theme-fg-muted)
	margin-top: $grid-gutter-width

	&:first-of-type
		margin-top: 0
</style>
