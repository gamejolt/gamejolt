import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../utils/vue';
import { Environment } from '../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../_common/filters/number';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppLoading from '../../../../_common/loading/loading.vue';
import AppNavTabList from '../../../../_common/nav/tab-list/tab-list.vue';
import AppPagination from '../../../../_common/pagination/pagination.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppNoAutoscroll } from '../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import AppScrollInview, { ScrollInviewConfig } from '../../../../_common/scroll/inview/inview.vue';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import AppGameFilteringTags from '../filtering/AppGameFilteringTags.vue';
import { GameFilteringContainer } from '../filtering/container';
import AppGameFilteringWidget from '../filtering/widget.vue';
import AppGameGridPlaceholder from '../grid/placeholder/placeholder.vue';
import { GameListingContainer } from './listing-container-service';

@Options({
	components: {
		AppPagination,
		AppLoadingFade,
		AppGameFilteringWidget,
		AppGameFilteringTags,
		AppGameGridPlaceholder,
		AppNavTabList,
		AppScrollInview,
		AppLoading,
	},
	directives: {
		AppNoAutoscroll,
	},
})
export default class AppGameListing extends Vue {
	@Prop(propRequired(Object)) listing!: GameListingContainer;
	@Prop(propRequired(Object)) filtering!: GameFilteringContainer;
	@Prop(propOptional(Boolean, false)) hideFilters!: boolean;
	@Prop(propOptional(Boolean, false)) hideSectionNav!: boolean;
	@Prop(propOptional(Boolean, false)) includeFeaturedSection!: boolean;
	@Prop(propOptional(Boolean, false)) isLoading!: boolean;

	/**
	 * If it's infinite, it won't show pagination controls and will instead emit
	 * a `load` event when scrolling down.
	 */
	@Prop(propOptional(Boolean, false)) infinite!: boolean;

	inviewConfig = new ScrollInviewConfig();

	readonly formatNumber = formatNumber;
	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Scroll = Scroll;

	@Emit('load')
	emitLoad() {}
}
