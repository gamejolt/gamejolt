import { Ads } from 'game-jolt-frontend-lib/components/ad/ads.service';
import AppAdWidget from 'game-jolt-frontend-lib/components/ad/widget/widget.vue';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import AppLoadingFade from 'game-jolt-frontend-lib/components/loading/fade/fade.vue';
import AppNavTabList from 'game-jolt-frontend-lib/components/nav/tab-list/tab-list.vue';
import AppPagination from 'game-jolt-frontend-lib/components/pagination/pagination.vue';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppGameFilteringTags from '../filtering/tags.vue';
import AppGameFilteringWidget from '../filtering/widget.vue';
import AppGameGridPlaceholder from '../grid/placeholder/placeholder.vue';
import { GameListingContainer } from './listing-container-service';

@Component({
	components: {
		AppAdWidget,
		AppPagination,
		AppLoadingFade,
		AppGameFilteringWidget,
		AppGameFilteringTags,
		AppGameGridPlaceholder,
		AppNavTabList,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class AppGameListing extends Vue {
	@Prop(Object)
	listing!: GameListingContainer;
	@Prop(Boolean)
	hideFilters?: boolean;
	@Prop(Boolean)
	hideSectionNav?: boolean;
	@Prop(Boolean)
	includeFeaturedSection?: boolean;
	@Prop(Boolean)
	isLoading?: boolean;
	@Prop({ type: Boolean, default: true })
	showAds!: boolean;
	@Prop({ type: Boolean, default: true })
	showFooterAd!: boolean;

	readonly number = number;
	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Scroll = Scroll;

	get shouldShowAds() {
		return Ads.shouldShow;
	}
}
