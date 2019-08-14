import { Ads } from '../../../../_common/ad/ads.service';
import AppAdWidget from '../../../../_common/ad/widget/widget.vue';
import { AppTrackEvent } from '../../../../_common/analytics/track-event.directive';
import { Environment } from '../../../../_common/environment/environment.service';
import AppLoadingFade from '../../../../_common/loading/fade/fade.vue';
import AppNavTabList from '../../../../_common/nav/tab-list/tab-list.vue';
import AppPagination from '../../../../_common/pagination/pagination.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import { number } from '../../../../_common/filters/number';
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
