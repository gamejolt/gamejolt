<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Environment } from '../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../_common/filters/number';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppLoading from '../../../../_common/loading/loading.vue';
import AppNavTabList from '../../../../_common/nav/tab-list/tab-list.vue';
import AppPagination from '../../../../_common/pagination/pagination.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppNoAutoscroll } from '../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
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
</script>

<template>
	<div id="games" class="game-listing">
		<section class="section">
			<div class="container-xl">
				<AppNavTabList v-if="!hideSectionNav">
					<ul>
						<li v-if="includeFeaturedSection">
							<router-link
								v-app-no-autoscroll
								v-app-track-event="`game-list:section-selector:featured`"
								:to="{ name: $route.name, params: { section: null } }"
								:class="{ active: !$route.params.section }"
							>
								<AppTranslate>Featured</AppTranslate>
							</router-link>
						</li>
						<li>
							<router-link
								v-app-no-autoscroll
								v-app-track-event="`game-list:section-selector:hot`"
								:to="{ name: $route.name, params: { section: 'hot' } }"
								:class="{ active: $route.params.section === 'hot' }"
							>
								<AppTranslate>Hot</AppTranslate>
							</router-link>
						</li>
						<li>
							<router-link
								v-app-no-autoscroll
								v-app-track-event="`game-list:section-selector:best`"
								:to="{ name: $route.name, params: { section: 'best' } }"
								:class="{ active: $route.params.section === 'best' }"
							>
								<AppTranslate>Best</AppTranslate>
							</router-link>
						</li>
						<li>
							<router-link
								v-app-no-autoscroll
								v-app-track-event="`game-list:section-selector:new`"
								:to="{ name: $route.name, params: { section: 'new' } }"
								:class="{ active: $route.params.section === 'new' }"
							>
								<AppTranslate>New</AppTranslate>
							</router-link>
						</li>
					</ul>
				</AppNavTabList>

				<template v-if="!hideFilters">
					<div class="-filtering-well">
						<AppGameFilteringWidget :filtering="filtering" />
					</div>

					<div class="clearfix">
						<AppGameFilteringTags :filtering="filtering" />
					</div>
					<br />
				</template>

				<template v-if="listing.isBootstrapped">
					<template v-if="listing.gamesCount">
						<AppLoadingFade :is-loading="isLoading">
							<slot />
						</AppLoadingFade>

						<template v-if="!infinite || GJ_IS_SSR">
							<AppPagination
								class="text-center"
								:items-per-page="listing.perPage"
								:total-items="listing.gamesCount"
								:current-page="listing.currentPage"
								@pagechange="Scroll.to('games', { animate: false })"
							/>
						</template>
						<template v-else-if="!listing.reachedEnd">
							<AppScrollInview
								v-if="!listing.isLoadingMore"
								:config="inviewConfig"
								@inview="emitLoad"
							/>
							<AppLoading v-else centered />
						</template>
					</template>
				</template>
				<AppGameGridPlaceholder v-else :num="16" />

				<div
					v-if="listing.isBootstrapped && !listing.gamesCount"
					class="alert alert-notice anim-fade-in-enlarge"
				>
					<p>
						<AppTranslate>No games match your filters. Zoinks!</AppTranslate>
					</p>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.game-listing
	.-filtering-well
		change-bg('bg-offset')
		rounded-corners()
		padding: $font-size-base 16px 0 16px

	.game-filtering-tags
		margin-bottom: 0
</style>
