<script lang="ts">
export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => Api.sendRequest('/web/stickers/dash'),
	}),
};

type InitPayload = {
	balance: number;
	stickerCounts: StickerCountPayload[];
	stickers: any[];
	stickerCost: number;
	newStickerIds: number[];
};

type StickerCountPayload = {
	sticker_id: number;
	count: number;
};
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { numberSort } from '../../../../utils/array';
import { Api } from '../../../../_common/api/api.service';
import { configChargedStickers } from '../../../../_common/config/config.service';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppProgressBar from '../../../../_common/progress/AppProgressBar.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppStickerCard from '../../../../_common/sticker/card/AppStickerCard.vue';
import AppStickerChargeCard from '../../../../_common/sticker/charge/AppStickerChargeCard.vue';
import { Sticker, StickerStack } from '../../../../_common/sticker/sticker.model';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { useAppStore } from '../../../store';
import backgroundImage from './background.png';

const store = useAppStore();
const { grid } = store;

const balance = ref(0);
const generalStickers = ref<StickerStack[]>([]);
const eventStickers = ref<StickerStack[]>([]);
const stickerCost = ref(10);
const newStickerIds = ref<number[]>([]);

const routeTitle = computed(() => {
	return $gettext(`Your Stickers`);
});

const hasStickersInCollection = computed(() => {
	return generalStickers.value.length > 0 || eventStickers.value.length > 0;
});

const stickerProgress = computed(() => {
	const progress = balance.value % stickerCost.value;
	return Math.floor((progress / stickerCost.value) * 100);
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
	onResolved(data) {
		const payload: InitPayload = data.payload;

		balance.value = payload.balance;
		stickerCost.value = payload.stickerCost;
		newStickerIds.value = payload.newStickerIds;

		generalStickers.value = [];
		eventStickers.value = [];

		for (const stickerCountPayload of payload.stickerCounts) {
			const stickerData = payload.stickers.find(i => i.id === stickerCountPayload.sticker_id);
			const stickerCount = {
				count: stickerCountPayload.count,
				sticker_id: stickerCountPayload.sticker_id,
				sticker: new Sticker(stickerData),
			} as StickerStack;

			if (stickerCount.sticker.is_event) {
				eventStickers.value.push(stickerCount);
			} else {
				generalStickers.value.push(stickerCount);
			}
		}

		const lists = [generalStickers.value, eventStickers.value];
		lists.forEach(list => {
			list.sort((a, b) => numberSort(b.sticker.rarity, a.sticker.rarity));

			// Sort all "new" stickers to the top.
			if (newStickerIds.value.length > 0) {
				const newStickers = list.filter(x => newStickerIds.value.includes(x.sticker_id));
				list = list.filter(x => !newStickers.includes(x));
				list.unshift(...newStickers);
			}
		});

		grid.value?.pushViewNotifications('stickers');
	},
});
</script>

<template>
	<div class="route-dash-stickers">
		<AppPageHeader :cover-media-item="coverMediaItem" :cover-max-height="250">
			<RouterLink :to="{ name: 'dash.stickers' }">
				<h1 class="section-header sans-margin-bottom">
					<AppTranslate>Your Stickers</AppTranslate>
				</h1>
			</RouterLink>
			<div class="text-muted small">
				<p>
					<AppTranslate> Marvel at your collection of beautiful stickers. </AppTranslate>
				</p>
			</div>
		</AppPageHeader>

		<section class="section">
			<div class="container">
				<div class="row">
					<div class="col-md-4 col-md-push-8">
						<template v-if="configChargedStickers.value">
							<AppStickerChargeCard
								allow-overcharge-text
								:padding-h="24"
								:padding-v="24"
							/>

							<AppSpacer vertical :scale="6" />
						</template>

						<div class="-sidebar-card">
							<span class="-progress-header">
								{{ stickerProgress }}% to next sticker
							</span>

							<AppSpacer vertical :scale="1" />
							<AppProgressBar class="-progress" :percent="stickerProgress" thin />
							<AppSpacer vertical :scale="4" />

							<AppTranslate>
								Get more stickers by liking posts on Game Jolt. Every time you like
								a post, you gain progress to getting your next sticker. Like posts,
								get stickers!
							</AppTranslate>
						</div>

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
										<AppTranslate>
											{{
												i === 0
													? 'Event Stickers'
													: i === 1
													? 'General Stickers'
													: undefined
											}}
										</AppTranslate>
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
							<AppTranslate>You don't have any stickers yet.</AppTranslate>
						</p>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../../../_common/sticker/card/variables'

.route-dash-stickers
	change-bg(bg-offset)

.-progress-header
	font-size: $font-size-small
	color: var(--theme-fg-muted)

.-progress
	max-width: 350px
	margin: 0

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

.-sidebar-card
	rounded-corners-lg()
	change-bg(bg)
	padding: 24px
</style>
