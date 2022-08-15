<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { numberSort } from '../../../../utils/array';
import { shallowSetup } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import { useDrawerStore } from '../../../../_common/drawer/drawer-store';
import { formatNumber } from '../../../../_common/filters/number';
import { MediaItem } from '../../../../_common/media-item/media-item-model';
import AppProgressBar from '../../../../_common/progress/AppProgressBar.vue';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppStickerCard from '../../../../_common/sticker/card/AppStickerCard.vue';
import { Sticker, StickerStack } from '../../../../_common/sticker/sticker.model';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { useAppStore } from '../../../store';
import backgroundImage from './background.png';

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

const FetchStickersEndpoint = '/web/stickers/dash';

@Options({
	name: 'RouteDashStickers',
	components: {
		AppPageHeader,
		AppStickerCard,
		AppProgressBar,
	},
})
@OptionsForRoute({
	deps: {},
	resolver: () => Api.sendRequest(FetchStickersEndpoint),
})
export default class RouteDashStickers extends BaseRouteComponent {
	store = setup(() => useAppStore());
	drawer = shallowSetup(() => useDrawerStore());

	get grid() {
		return this.store.grid;
	}

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

	balance = 0;
	generalStickers: StickerStack[] = [];
	eventStickers: StickerStack[] = [];
	stickerCost = 10;
	newStickerIds: number[] = [];

	get routeTitle() {
		return this.$gettext(`Your Stickers`);
	}

	get hasStickersInCollection() {
		return this.generalStickers.length > 0 || this.eventStickers.length > 0;
	}

	get stickerProgress() {
		const progress = this.balance % this.stickerCost;
		return Math.floor((progress / this.stickerCost) * 100);
	}

	get coverMediaItem() {
		// Create fake media item resource to pass into the page header.
		return new MediaItem({
			is_animated: false,
			width: 1240,
			height: 409,
			img_url: backgroundImage,
			mediaserver_url: backgroundImage,
		});
	}

	routeResolved($payload: InitPayload) {
		this.balance = $payload.balance;
		this.stickerCost = $payload.stickerCost;
		this.newStickerIds = $payload.newStickerIds;

		this.generalStickers = [];
		this.eventStickers = [];

		for (const stickerCountPayload of $payload.stickerCounts) {
			const stickerData = $payload.stickers.find(
				i => i.id === stickerCountPayload.sticker_id
			);
			const stickerCount = {
				count: stickerCountPayload.count,
				sticker_id: stickerCountPayload.sticker_id,
				sticker: new Sticker(stickerData),
			} as StickerStack;

			if (stickerCount.sticker.is_event) {
				this.eventStickers.push(stickerCount);
			} else {
				this.generalStickers.push(stickerCount);
			}
		}

		const lists = [this.generalStickers, this.eventStickers];
		lists.forEach(list => {
			list.sort((a, b) => numberSort(b.sticker.rarity, a.sticker.rarity));

			// Sort all "new" stickers to the top.
			if (this.newStickerIds.length > 0) {
				const newStickers = list.filter(x => this.newStickerIds.includes(x.sticker_id));
				list = list.filter(x => !newStickers.includes(x));
				list.unshift(...newStickers);
			}
		});

		this.grid?.pushViewNotifications('stickers');
	}
}
</script>

<template>
	<div>
		<AppPageHeader :cover-media-item="coverMediaItem" :cover-max-height="250">
			<router-link :to="{ name: 'dash.stickers' }">
				<h1 class="section-header sans-margin-bottom">
					<AppTranslate>Your Stickers</AppTranslate>
				</h1>
			</router-link>
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
						<AppProgressBar class="-progress" :percent="stickerProgress">
							<strong>{{ stickerProgress }}% to next sticker</strong>
						</AppProgressBar>

						<p class="small">
							<AppTranslate>
								Get more stickers by liking posts on Game Jolt. Every time you like
								a post, you gain progress to getting your next sticker. Like posts,
								get stickers!
							</AppTranslate>
						</p>
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

.-progress
	max-width: 350px

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
