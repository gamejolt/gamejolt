<script lang="ts">
import { PropType } from 'vue';
import { RouterLink } from 'vue-router';
import AppAdStickyRail from '../../../../_common/ad/AppAdStickyRail.vue';
import { useAdStore } from '../../../../_common/ad/ad-store';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import AppLoadingFade from '../../../../_common/loading/AppLoadingFade.vue';
import AppNavTabList from '../../../../_common/nav/tab-list/AppNavTabList.vue';
import AppPagination from '../../../../_common/pagination/AppPagination.vue';
import { vAppNoAutoscroll } from '../../../../_common/scroll/auto-scroll/no-autoscroll.directive';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import { Scroll } from '../../../../_common/scroll/scroll.service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import AppGameFilteringTags from '../filtering/AppGameFilteringTags.vue';
import { GameFilteringContainer } from '../filtering/container';
import AppGameFilteringWidget from '../filtering/widget.vue';
import AppGameGridPlaceholder from '../grid/AppGameGridPlaceholder.vue';
import { GameListingContainer } from './listing-container-service';

const InviewConfig = new ScrollInviewConfig();
</script>

<script lang="ts" setup>
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
	showAds: {
		type: Boolean,
	},
});

const emit = defineEmits({
	load: () => true,
});

const { shouldShow: globalShouldShowAds } = useAdStore();
</script>

<template>
	<div id="games" class="game-listing">
		<section class="section section-thin">
			<template v-if="showAds && globalShouldShowAds">
				<AppAdWidget size="leaderboard" placement="content" />
				<AppSpacer vertical :scale="6" />
			</template>

			<AppAdStickyRail show-left>
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
									{{ $gettext(`Featured`) }}
								</RouterLink>
							</li>
							<li>
								<RouterLink
									v-app-no-autoscroll
									v-app-track-event="`game-list:section-selector:hot`"
									:to="{ name: $route.name!, params: { section: 'hot' } }"
									:class="{ active: $route.params.section === 'hot' }"
								>
									{{ $gettext(`Hot`) }}
								</RouterLink>
							</li>
							<li>
								<RouterLink
									v-app-no-autoscroll
									v-app-track-event="`game-list:section-selector:best`"
									:to="{ name: $route.name!, params: { section: 'best' } }"
									:class="{ active: $route.params.section === 'best' }"
								>
									{{ $gettext(`Best`) }}
								</RouterLink>
							</li>
							<li>
								<RouterLink
									v-app-no-autoscroll
									v-app-track-event="`game-list:section-selector:new`"
									:to="{ name: $route.name!, params: { section: 'new' } }"
									:class="{ active: $route.params.section === 'new' }"
								>
									{{ $gettext(`New`) }}
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
							{{ $gettext(`No games match your filters. Zoinks!`) }}
						</p>
					</div>
				</div>
			</AppAdStickyRail>
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
