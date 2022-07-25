<script lang="ts" setup>
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import AppNavTabList from '../../../../_common/nav/tab-list/tab-list.vue';
import AppPagination from '../../../../_common/pagination/pagination.vue';
import { vAppNoAutoscroll } from '../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppGameFilteringTags from '../filtering/AppGameFilteringTags.vue';
import { GameFilteringContainer } from '../filtering/container';
import AppGameFilteringWidget from '../filtering/widget.vue';
import AppGameGridPlaceholder from '../grid/placeholder/placeholder.vue';
import { GameListingContainer } from './listing-container-service';

defineProps({
	listing: {
		type: Object as PropType<GameListingContainer>,
		required: true,
	},
	filtering: {
		type: Object as PropType<GameFilteringContainer>,
		required: true,
	},
	hideFilters: {
		type: Boolean,
	},
	hideSectionNav: {
		type: Boolean,
	},
	includeFeaturedSection: {
		type: Boolean,
	},
	isLoading: {
		type: Boolean,
	},
});

const emit = defineEmits({
	load: () => true,
});

const InviewConfig = new ScrollInviewConfig();
</script>

<template>
	<div id="games" class="game-listing">
		<section class="section">
			<div class="container-xl">
				<AppNavTabList v-if="!hideSectionNav">
					<ul>
						<li v-if="includeFeaturedSection">
							<RouterLink
								v-app-no-autoscroll
								v-app-track-event="`game-list:section-selector:featured`"
								:to="{ name: $route.name!, params: { section: null } }"
								:class="{ active: !$route.params.section }"
							>
								<AppTranslate>Featured</AppTranslate>
							</RouterLink>
						</li>
						<li>
							<RouterLink
								v-app-no-autoscroll
								v-app-track-event="`game-list:section-selector:hot`"
								:to="{ name: $route.name!, params: { section: 'hot' } }"
								:class="{ active: $route.params.section === 'hot' }"
							>
								<AppTranslate>Hot</AppTranslate>
							</RouterLink>
						</li>
						<li>
							<RouterLink
								v-app-no-autoscroll
								v-app-track-event="`game-list:section-selector:best`"
								:to="{ name: $route.name!, params: { section: 'best' } }"
								:class="{ active: $route.params.section === 'best' }"
							>
								<AppTranslate>Best</AppTranslate>
							</RouterLink>
						</li>
						<li>
							<RouterLink
								v-app-no-autoscroll
								v-app-track-event="`game-list:section-selector:new`"
								:to="{ name: $route.name!, params: { section: 'new' } }"
								:class="{ active: $route.params.section === 'new' }"
							>
								<AppTranslate>New</AppTranslate>
							</RouterLink>
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

						<template v-if="!listing.loadInfinitely || GJ_IS_SSR">
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
								:config="InviewConfig"
								@inview="emit('load')"
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
