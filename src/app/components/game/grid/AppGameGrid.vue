<script lang="ts">
import { PropType, computed, toRef, toRefs } from 'vue';
import draggable from 'vuedraggable';
import { isAdEnthused, useAdStore } from '../../../../_common/ad/ad-store';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { GameModel } from '../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../_common/game/thumbnail/AppGameThumbnail.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import { styleWhen } from '../../../../_styles/mixins';
import { kLayerAds } from '../../../../_styles/variables';
import AppGameThumbnailControls from '../thumbnail/AppGameThumbnailControls.vue';

export const GameGridRowSizeSm = 2;
export const GameGridRowSizeMd = 3;
export const GameGridRowSizeLg = 3;

let idCounter = 0;
</script>

<script lang="ts" setup>
const props = defineProps({
	games: {
		type: Array as PropType<GameModel[]>,
		default: () => [],
	},
	gamesCount: {
		type: Number,
		default: 0,
	},
	currentPage: {
		type: Number,
		default: 0,
	},
	truncateToFit: {
		type: Boolean,
	},
	scrollable: {
		type: Boolean,
	},
	forceScrollable: {
		type: Boolean,
	},
	showAds: {
		type: Boolean,
	},
	canReorder: {
		type: Boolean,
	},
	eventLabel: {
		type: String,
		default: undefined,
	},
});

const emit = defineEmits({
	sort: (_games: GameModel[]) => true,
});

const { canReorder, showAds, truncateToFit, scrollable, forceScrollable, games } = toRefs(props);
const { shouldShow: globalShouldShowAds } = useAdStore();

const id = ++idCounter;

const shouldShowAds = toRef(() => !canReorder.value && showAds.value && globalShouldShowAds);
const isScrollable = toRef(() => (Screen.isXs && scrollable.value) || forceScrollable.value);
const shouldShowStickyVideoAd = toRef(() => isAdEnthused && Screen.width >= 2100);

const rowSize = toRef(() => {
	if (Screen.isSm) {
		return GameGridRowSizeSm;
	} else if (Screen.isMd) {
		return GameGridRowSizeMd;
	} else if (Screen.isLg) {
		return GameGridRowSizeLg;
	}

	return games.value.length;
});

/**
 * Depending on the screen size, we want to only show a certain number of
 * games. This will trim the last few games off if it can't fit within the
 * rows completely.
 */
const processedGames = computed({
	get: () => {
		if (!truncateToFit.value || isScrollable.value) {
			return games.value;
		}

		let chunkSize = Math.max(1, Math.floor(games.value.length / rowSize.value)) * rowSize.value;

		// Subtract one for the ad slot.
		if (Screen.isDesktop && shouldShowAds.value) {
			chunkSize -= 1;
		}

		return games.value.slice(0, chunkSize);
	},
	set: games => {
		emit('sort', games);
	},
});

function shouldShowAd(index: number) {
	if (!shouldShowAds.value || isScrollable.value) {
		return false;
	}

	const numGames = processedGames.value.length;

	index = index + 1;
	if (Screen.isDesktop) {
		// Show every X games. This index will set it to be the the third
		// placement in the row which looks pretty good.
		if (index % 13 === 0) {
			return true;
		}
	} else if (Screen.isSm) {
		// Show after the first 4 games, but only if 6 or more will show
		// after the ad.
		if (index === 5 && numGames - index >= 6) {
			return true;
		} else if (index > 5 && (index - 5) % 10 === 0 && numGames - index >= 6) {
			// Show every 10 games after the first 4, but only if 6 or more will
			// show after the ad.
			return true;
		}
	} else if (Screen.isXs) {
		// Show after the first 2 games, but only if 6 or more will show
		// after the ad.
		if (index === 3 && numGames - index >= 6) {
			return true;
		} else if (index > 3 && (index - 3) % 8 === 0 && numGames - index >= 6) {
			// Show every 8 games after the first 2, but only if 6 or more will
			// show after the ad.
			return true;
		}
	}

	return false;
}
</script>

<template>
	<div :id="`grid-pagination-${id}`">
		<p v-if="gamesCount" class="text-muted small">
			{{
				$gettext(`Page %{ page } of %{ count } games.`, {
					count: formatNumber(gamesCount),
					page: formatNumber(currentPage),
				})
			}}
		</p>

		<div :class="{ 'scrollable-grid': isScrollable }">
			<div class="_game-grid-items">
				<div v-if="Screen.isDesktop && shouldShowAds" class="_game-grid-ad">
					<div
						:style="{
							...styleWhen(shouldShowStickyVideoAd, {
								margin: `0 auto`,
								maxWidth: `400px`,
							}),
						}"
					>
						<AppScrollAffix
							:style="{ position: `relative`, zIndex: kLayerAds }"
							:disabled="!shouldShowStickyVideoAd"
							:padding="8"
							:affixed-styles="{ right: `8px` }"
						>
							<div class="_game-grid-ad-inner">
								<AppAdWidget
									:size="shouldShowStickyVideoAd ? 'video' : 'rectangle-fix'"
									placement="feed"
								/>
							</div>
						</AppScrollAffix>
					</div>
				</div>

				<template v-if="canReorder">
					<draggable
						v-model="processedGames"
						v-bind="{ delay: 100, delayOnTouchOnly: true }"
						item-key="id"
					>
						<template #item="{ element }">
							<div class="_game-grid-item">
								<AppGameThumbnail
									v-app-track-event="
										eventLabel ? 'game-grid:click:' + eventLabel : undefined
									"
									:game="element"
								>
									<slot name="thumbnail-controls" :game="element">
										<AppGameThumbnailControls :game="element" />
									</slot>
								</AppGameThumbnail>
							</div>
						</template>
					</draggable>
				</template>

				<template v-else>
					<!--
					Keep the end div and the opening div together below. If you
					don't it will not wrap correctly in the DOM since it adds
					the space.
					-->
					<template v-for="(game, i) of processedGames" :key="game.id">
						<div v-if="shouldShowAd(i)" class="_game-grid-ad">
							<div class="_game-grid-ad-inner">
								<AppAdWidget size="rectangle" placement="feed" />
							</div>
						</div>
						<div class="_game-grid-item">
							<AppGameThumbnail
								v-app-track-event="
									eventLabel ? 'game-grid:click:' + eventLabel : undefined
								"
								:game="game"
							>
								<slot name="thumbnail-controls" :game="game">
									<AppGameThumbnailControls :game="game" />
								</slot>
							</AppGameThumbnail>
						</div>
					</template>
				</template>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" src="./grid.styl"></style>
