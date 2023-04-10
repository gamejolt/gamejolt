<script lang="ts">
import { setup } from 'vue-class-component';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import draggable from 'vuedraggable';
import { useAdsController } from '../../../../_common/ad/ad-store';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { Game } from '../../../../_common/game/game.model';
import AppGameThumbnail from '../../../../_common/game/thumbnail/AppGameThumbnail.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppGameThumbnailControls from '../thumbnail/AppGameThumbnailControls.vue';

export const GameGridRowSizeSm = 2;
export const GameGridRowSizeMd = 3;
export const GameGridRowSizeLg = 3;

let idCounter = 0;

@Options({
	components: {
		AppGameThumbnail,
		AppGameThumbnailControls,
		AppAdWidget,
		draggable,
	},
})
export default class AppGameGrid extends Vue {
	@Prop({ type: Array, default: () => [] }) games!: Game[];
	@Prop({ type: Number, default: 0 }) gamesCount!: number;
	@Prop({ type: Number, default: 0 }) currentPage!: number;
	@Prop({ type: Boolean, default: false }) truncateToFit!: boolean;
	@Prop({ type: Boolean, default: false }) scrollable!: boolean;
	@Prop({ type: Boolean, default: false }) forceScrollable!: boolean;
	@Prop({ type: Boolean, default: false }) showAds!: boolean;
	@Prop({ type: Boolean, default: false }) canReorder!: boolean;
	@Prop(String) eventLabel?: string;

	@Emit('sort') emitSort(_games: Game[]) {}

	ads = setup(() => useAdsController());

	id = ++idCounter;

	readonly formatNumber = formatNumber;
	readonly Screen = Screen;

	get shouldShowAds() {
		return !this.canReorder && this.showAds && this.ads.shouldShow;
	}

	get isScrollable() {
		return (Screen.isXs && this.scrollable) || this.forceScrollable;
	}

	/**
	 * Depending on the screen size, we want to only show a certain number of
	 * games. This will trim the last few games off if it can't fit within the
	 * rows completely.
	 */
	get processedGames() {
		const games = this.games;

		if (!this.truncateToFit || this.isScrollable) {
			return games;
		}

		let chunkSize = Math.max(1, Math.floor(games.length / this.rowSize)) * this.rowSize;

		// Subtract one for the ad slot.
		if (Screen.isDesktop && this.shouldShowAds) {
			chunkSize -= 1;
		}

		return games.slice(0, chunkSize);
	}

	set processedGames(games: Game[]) {
		this.emitSort(games);
	}

	get rowSize() {
		if (Screen.isSm) {
			return GameGridRowSizeSm;
		} else if (Screen.isMd) {
			return GameGridRowSizeMd;
		} else if (Screen.isLg) {
			return GameGridRowSizeLg;
		}

		return this.games.length;
	}

	shouldShowAd(index: number) {
		if (!this.shouldShowAds || this.isScrollable) {
			return false;
		}

		const numGames = this.processedGames.length;

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
}
</script>

<template>
	<div :id="`grid-pagination-${id}`">
		<p v-if="gamesCount" class="text-muted small">
			<AppTranslate
				:translate-n="gamesCount"
				:translate-params="{
					count: formatNumber(gamesCount),
					page: formatNumber(currentPage),
				}"
				translate-plural="Page %{ page } of %{ count } games."
			>
				Page %{ page } of %{ count } games.
			</AppTranslate>
		</p>

		<div :class="{ 'scrollable-grid': isScrollable }">
			<div class="game-grid-items">
				<div v-if="Screen.isDesktop && shouldShowAds" class="game-grid-ad">
					<div class="game-grid-ad-inner">
						<AppAdWidget
							size="rectangle"
							placement="content"
							:meta="{ staticSize: true }"
						/>
					</div>
				</div>

				<template v-if="canReorder">
					<draggable
						v-model="processedGames"
						v-bind="{ delay: 100, delayOnTouchOnly: true }"
						item-key="id"
					>
						<template #item="{ element }">
							<div class="game-grid-item">
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
						don't it will not wrap correctly in the DOM since it adds the
						space.
					-->
					<template v-for="(game, i) of processedGames" :key="game.id">
						<div v-if="shouldShowAd(i)" class="game-grid-ad">
							<div class="game-grid-ad-inner">
								<AppAdWidget
									size="rectangle"
									placement="content"
									:meta="{ staticSize: true }"
								/>
							</div>
						</div>
						<div class="game-grid-item">
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
