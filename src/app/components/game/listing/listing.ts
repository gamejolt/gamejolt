import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Environment } from '../../../../_common/environment/environment.service';
import { number } from '../../../../_common/filters/number';
import AppLoadingFade from '../../../../_common/loading/fade/fade.vue';
import AppNavTabList from '../../../../_common/nav/tab-list/tab-list.vue';
import AppPagination from '../../../../_common/pagination/pagination.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppNoAutoscroll } from '../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import AppGameFilteringTags from '../filtering/tags.vue';
import AppGameFilteringWidget from '../filtering/widget.vue';
import AppGameGridPlaceholder from '../grid/placeholder/placeholder.vue';
import { GameListingContainer } from './listing-container-service';

@Component({
	components: {
		AppPagination,
		AppLoadingFade,
		AppGameFilteringWidget,
		AppGameFilteringTags,
		AppGameGridPlaceholder,
		AppNavTabList,
	},
	directives: {
		AppNoAutoscroll,
	},
})
export default class AppGameListing extends Vue {
	@Prop(Object) listing!: GameListingContainer;
	@Prop(Boolean) hideFilters?: boolean;
	@Prop(Boolean) hideSectionNav?: boolean;
	@Prop(Boolean) includeFeaturedSection?: boolean;
	@Prop(Boolean) isLoading?: boolean;

	readonly number = number;
	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Scroll = Scroll;
}
