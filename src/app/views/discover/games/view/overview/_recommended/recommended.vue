<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { useAdsController } from '../../../../../../../_common/ad/ad-store';
import AppAdWidget from '../../../../../../../_common/ad/widget/widget.vue';
import { Screen } from '../../../../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../../../../_common/scroll/affix/affix.vue';
import AppGameList from '../../../../../../components/game/list/list.vue';
import AppGameListPlaceholder from '../../../../../../components/game/list/placeholder/placeholder.vue';
import { useGameRouteController } from '../../view.vue';

@Options({
	components: {
		AppGameListPlaceholder,
		AppGameList,
		AppAdWidget,
		AppScrollAffix,
	},
})
export default class AppDiscoverGamesViewOverviewRecommended extends Vue {
	routeStore = setup(() => useGameRouteController()!);
	ads = setup(() => useAdsController());

	readonly Screen = Screen;

	get recommendedGames() {
		return this.routeStore.recommendedGames;
	}

	get postsCount() {
		return this.routeStore.postsCount;
	}

	get isLoaded() {
		return this.recommendedGames.length > 0;
	}

	get shouldShowAds() {
		return this.ads.shouldShow;
	}

	get shouldShowBottomAd() {
		// We only want to show the bottom ad if there is enough room on the
		// page.
		return this.shouldShowAds && this.postsCount > 2 && Screen.isLg;
	}
}
</script>

<template>
	<app-game-list-placeholder v-if="!isLoaded" :num="5" />
	<div v-else>
		<app-game-list :games="recommendedGames" event-label="recommended" />

		<template v-if="shouldShowBottomAd">
			<!-- Extra space for the page nav -->
			<app-scroll-affix :scroll-offset="80">
				<div class="-ad">
					<app-ad-widget size="video" placement="side" />
				</div>
			</app-scroll-affix>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-ad
	width: 300px
	margin-bottom: $line-height-computed

// Put some extra spacing in here because of the affixed game header.
.gj-scroll-affixed .-ad
	margin-top: $shell-top-nav-height + 10px !important
</style>
