import { Emit, Prop, Vue } from 'vue-property-decorator';
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
ponents: {
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
	@Prop({ type: Object, required: true }) listing!: GameListingContainer;
	@Prop({ type: Object, required: true }) filtering!: GameFilteringContainer;
	@Prop({ type: Boolean, default: false }) hideFilters!: boolean;
	@Prop({ type: Boolean, default: false }) hideSectionNav!: boolean;
	@Prop({ type: Boolean, default: false }) includeFeaturedSection!: boolean;
	@Prop({ type: Boolean, default: false }) isLoading!: boolean;

	/**
	 * If it's infinite, it won't show pagination controls and will instead emit
	 * a `load` event when scrolling down.
	 */
	@Prop({ type: Boolean, default: false }) infinite!: boolean;

	inviewConfig = new ScrollInviewConfig();

	readonly formatNumber = formatNumber;
	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Scroll = Scroll;

	@Emit('load')
	emitLoad() {}
}
