import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../utils/vue';
import { Environment } from '../../../../_common/environment/environment.service';
import { number } from '../../../../_common/filters/number';
import AppLoadingFade from '../../../../_common/loading/fade/fade.vue';
import AppLoading from '../../../../_common/loading/loading.vue';
import AppNavTabList from '../../../../_common/nav/tab-list/tab-list.vue';
import AppPagination from '../../../../_common/pagination/pagination.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppNoAutoscroll } from '../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import { ScrollInviewConfig } from '../../../../_common/scroll/inview/config';
import { AppScrollInview } from '../../../../_common/scroll/inview/inview';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import { GameFilteringContainer } from '../filtering/container';
import AppGameFilteringTags from '../filtering/tags.vue';
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
	@Prop(propRequired(GameListingContainer)) listing!: GameListingContainer;
	@Prop(propRequired(GameFilteringContainer)) filtering!: GameFilteringContainer;
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

	readonly number = number;
	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Scroll = Scroll;
	readonly GJ_IS_SSR = GJ_IS_SSR;

	@Emit('load')
	emitLoad() {}
}
