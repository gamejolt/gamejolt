import View from '!view!./listing.html?style=./listing.styl';
import { AppAdWidget } from 'game-jolt-frontend-lib/components/ad/widget/widget';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Ads } from '../../../../lib/gj-lib-client/components/ad/ads.service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppLoadingFade } from '../../../../lib/gj-lib-client/components/loading/fade/fade';
import { AppNavTabList } from '../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppPagination } from '../../../../lib/gj-lib-client/components/pagination/pagination';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppGameFilteringTags } from '../filtering/tags';
import { AppGameFilteringWidget } from '../filtering/widget';
import { AppGameGridPlaceholder } from '../grid/placeholder/placeholder';
import { GameListingContainer } from './listing-container-service';

@View
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
export class AppGameListing extends Vue {
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
