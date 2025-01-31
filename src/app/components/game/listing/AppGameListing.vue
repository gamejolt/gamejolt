<script lang="ts">
import { computed, toRef } from 'vue';
import { RouterLink } from 'vue-router';
import AppAdStickyRail from '../../../../_common/ad/AppAdStickyRail.vue';
import AppAdTakeoverFloat from '../../../../_common/ad/AppAdTakeoverFloat.vue';
import { AdsGPTEnabledGlobally, useAdStore } from '../../../../_common/ad/ad-store';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import { ComponentProps } from '../../../../_common/component-helpers';
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
type Props = {
	listing: GameListingContainer;
	filtering: GameFilteringContainer;
	hideFilters?: boolean;
	hideSectionNav?: boolean;
	includeFeaturedSection?: boolean;
	isLoading?: boolean;
	showAds?: boolean;
};

defineProps<Props>();

const emit = defineEmits<{ load: [] }>();

const { shouldShow: globalShouldShowAds } = useAdStore();

// We essentially don't want to show the sticky rail if we're showing the takeovers.
const stickyRailComponent = toRef(() => (AdsGPTEnabledGlobally ? 'div' : AppAdStickyRail));
const stickyRailProps = computed(() =>
	AdsGPTEnabledGlobally
		? {}
		: ({ showLeft: true } satisfies ComponentProps<typeof AppAdStickyRail>)
);
</script>

<template>
	<div id="games" class="game-listing">
		<section class="section section-thin">
			<template v-if="showAds && globalShouldShowAds && !AdsGPTEnabledGlobally">
				<AppAdTakeoverFloat>
					<AppAdWidget size="leaderboard" placement="top" />
					<AppSpacer vertical :scale="6" />
				</AppAdTakeoverFloat>
			</template>

			<component :is="stickyRailComponent" v-bind="stickyRailProps">
				<div class="container-xl">
					<AppAdTakeoverFloat>
						<AppNavTabList v-if="!hideSectionNav" sans-margin-bottom>
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
					</AppAdTakeoverFloat>

					<template v-if="listing.isBootstrapped">
						<template v-if="listing.gamesCount">
							<!-- Let the game grid itself do its own takeover floats. -->
							<AppLoadingFade :is-loading="isLoading">
								<slot />
							</AppLoadingFade>

							<AppAdTakeoverFloat>
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
							</AppAdTakeoverFloat>
						</template>
					</template>
					<AppGameGridPlaceholder v-else :num="16" />

					<AppAdTakeoverFloat>
						<div
							v-if="listing.isBootstrapped && !listing.gamesCount"
							class="alert alert-notice anim-fade-in-enlarge"
						>
							<p>
								{{ $gettext(`No games match your filters. Zoinks!`) }}
							</p>
						</div>
					</AppAdTakeoverFloat>
				</div>
			</component>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.game-listing
	.-filtering-well
		change-bg('bg')
		rounded-corners()
		padding: $font-size-base 16px 0 16px

	.game-filtering-tags
		margin-bottom: 0
</style>
