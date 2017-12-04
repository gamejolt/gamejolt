import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./listing.html?style=./listing.styl';

import { GameListingContainer } from './listing-container-service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppAd } from '../../../../lib/gj-lib-client/components/ad/ad';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppPagination } from '../../../../lib/gj-lib-client/components/pagination/pagination';
import { AppGameFilteringWidget } from '../filtering/widget';
import { AppGameFilteringTags } from '../filtering/tags';
import { AppLoadingFade } from '../../../../lib/gj-lib-client/components/loading/fade/fade';
import { AppGameGridPlaceholder } from '../grid/placeholder/placeholder';
import { AppNavTabList } from '../../../../lib/gj-lib-client/components/nav/tab-list/tab-list';
import { AppAdPlacement } from '../../../../lib/gj-lib-client/components/ad/placement/placement';
import { Ads } from '../../../../lib/gj-lib-client/components/ad/ads.service';

@View
@Component({
	components: {
		AppAd,
		AppAdPlacement,
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
	@Prop(Object) listing: GameListingContainer;
	@Prop(Boolean) hideFilters?: boolean;
	@Prop(Boolean) hideSectionNav?: boolean;
	@Prop(Boolean) includeFeaturedSection?: boolean;
	@Prop(Boolean) isLoading?: boolean;
	@Prop({ type: Boolean, default: true })
	showAds: boolean;
	@Prop({ type: Boolean, default: true })
	showFooterAd: boolean;

	readonly number = number;
	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Scroll = Scroll;

	get shouldShowAds() {
		return Ads.shouldShow;
	}
}
