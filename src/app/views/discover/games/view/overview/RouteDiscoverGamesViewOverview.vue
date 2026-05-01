<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppActivityFeedPlaceholder from '~app/components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '~app/components/activity/feed/feed-service';
import { ActivityFeedView } from '~app/components/activity/feed/view';
import AppCommentAddButton from '~app/components/comment/add-button/AppCommentAddButton.vue';
import AppCommentOverview from '~app/components/comment/AppCommentOverview.vue';
import { showCommentModal } from '~app/components/comment/modal/modal.service';
import {
	CommentThreadModalPermalinkDeregister,
	showCommentThreadModalFromPermalink,
	watchForCommentThreadModalPermalink,
} from '~app/components/comment/thread/modal.service';
import AppGameCommunityBadge from '~app/components/game/community-badge/AppGameCommunityBadge.vue';
import AppGameList from '~app/components/game/list/AppGameList.vue';
import AppGameListPlaceholder from '~app/components/game/list/AppGameListPlaceholder.vue';
import AppGameOgrs from '~app/components/game/ogrs/AppGameOgrs.vue';
import { AppActivityFeedLazy } from '~app/components/lazy';
import AppPageContainer from '~app/components/page-container/AppPageContainer.vue';
import AppPostAddButton from '~app/components/post/add-button/AppPostAddButton.vue';
import AppShellPageBackdrop from '~app/components/shell/AppShellPageBackdrop.vue';
import AppUserKnownFollowers from '~app/components/user/known-followers/AppUserKnownFollowers.vue';
import AppGameDetails from '~app/views/discover/games/view/overview/_details/AppGameDetails.vue';
import AppGameStatbar from '~app/views/discover/games/view/overview/_statbar/AppGameStatbar.vue';
import AppDiscoverGamesViewOverviewSupporters from '~app/views/discover/games/view/overview/AppDiscoverGamesViewOverviewSupporters.vue';
import { useGameRouteController } from '~app/views/discover/games/view/RouteDiscoverGamesView.vue';
import { useAdStore } from '~common/ad/ad-store';
import AppAdStickyRail from '~common/ad/AppAdStickyRail.vue';
import AppAdWidget from '~common/ad/widget/AppAdWidget.vue';
import { trackExperimentEngagement } from '~common/analytics/analytics.service';
import { Api } from '~common/api/api.service';
import AppFadeCollapse from '~common/AppFadeCollapse.vue';
import AppButton from '~common/button/AppButton.vue';
import { canCommentOnModel, CommentModel } from '~common/comment/comment-model';
import { getCommentStore, useCommentStoreManager } from '~common/comment/comment-store';
import { configGuestNoAuthRequired } from '~common/config/config.service';
import AppContentViewer from '~common/content/content-viewer/AppContentViewer.vue';
import { formatNumber } from '~common/filters/number';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import AppGameExternalPackageCard from '~common/game/external-package/card/AppGameExternalPackageCard.vue';
import { GameModel } from '~common/game/game.model';
import AppGameMediaBar from '~common/game/media-bar/AppGameMediaBar.vue';
import AppGamePackageCard from '~common/game/package/card/AppGamePackageCard.vue';
import AppGameSoundtrackCard from '~common/game/soundtrack/card/AppGameSoundtrackCard.vue';
import { sendHistoryTick } from '~common/history-tick/history-tick-service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppLazyPlaceholder from '~common/lazy/placeholder/AppLazyPlaceholder.vue';
import { Meta } from '~common/meta/meta-service';
import { storeModelList } from '~common/model/model-store.service';
import { getPartnerReferrer } from '~common/partner-referral/partner-referral-service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { getScreen } from '~common/screen/screen-service';
import AppScrollAffix from '~common/scroll/AppScrollAffix.vue';
import AppShareCard from '~common/share/card/AppShareCard.vue';
import AppSpacer from '~common/spacer/AppSpacer.vue';
import { kThemeBgSubtle } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';
import { styleChangeBg, styleElevate, styleWhen } from '~styles/mixins';
import { kBorderRadiusLg, kBorderWidthSm, kLayerAds, kLineHeightComputed } from '~styles/variables';
import { getAbsoluteLink } from '~utils/router';

export default {
	...defineAppRouteOptions({
		lazy: true,
		cache: true,
		reloadOn: { query: ['feed_last_id'] },
		resolver({ route }) {
			// If we have a tracked partner "ref" in the URL, we want to pass that along
			// when gathering the payload.
			let apiOverviewUrl = '/web/discover/games/overview/' + route.params.id;

			const ref = getPartnerReferrer('Game', parseInt(route.params.id as string));
			if (ref) {
				apiOverviewUrl += '?ref=' + ref;
			}

			return Api.sendRequest(ActivityFeedService.makeFeedUrl(route, apiOverviewUrl));
		},
	}),
};
</script>

<script lang="ts" setup>
const {
	game,
	browserBuilds,
	isOverviewLoaded,
	mediaItems,
	overviewComments,
	songs,
	supporters,
	supporterCount,
	shouldShowMultiplePackagesMessage,
	postsCount,
	packages,
	externalPackages,
	hasReleasesSection,
	customGameMessages,
	showDetails,
	knownFollowers,
	knownFollowerCount,
	recommendedGames,
	processOverviewPayload,
	setOverviewComments,
	setCanToggleDescription,
	toggleDetails,
} = useGameRouteController()!;

const { shouldShow: globalShouldShowAds } = useAdStore();
const commentManager = useCommentStoreManager()!;
const router = useRouter();
const route = useRoute();
const { isLg, isMobile, screenWidth } = getScreen();

const isBootstrapped = ref(false);
const feed = ref(null) as Ref<ActivityFeedView | null>;
let permalinkWatchDeregister: CommentThreadModalPermalinkDeregister | undefined;

const hasDevlogPerms = computed(() => Boolean(game.value?.hasPerms('devlogs')));

const commentsCount = computed(() => {
	if (game.value) {
		const store = getCommentStore(commentManager, 'Game', game.value.id);
		return store ? store.totalCount : 0;
	}
	return 0;
});

const shouldShowCommentAdd = computed(() => {
	if (configGuestNoAuthRequired.value) {
		return false;
	}
	return Boolean(game.value && canCommentOnModel(game.value));
});

const shareLink = computed(() => {
	if (!game.value) {
		return undefined;
	}

	return getAbsoluteLink(router, game.value.getUrl());
});

const appRoute = createAppRoute({
	routeTitle: computed(() => {
		if (game.value) {
			let title = $gettext('%{ gameTitle } by %{ user }', {
				gameTitle: game.value.title,
				user: game.value.developer.display_name,
			});

			if (browserBuilds.value.length) {
				title += ' - ' + $gettext('Play Online');
			}

			return title;
		}
		return null;
	}),
	onInit() {
		const gameId = parseInt(route.params.id as string);
		sendHistoryTick('game-view', gameId, {
			sourceResource: 'Game',
			sourceResourceId: gameId,
		});

		feed.value = ActivityFeedService.routeInit(isBootstrapped.value);
	},
	onResolved({ payload, fromCache }) {
		isBootstrapped.value = true;

		processOverviewPayload(payload);

		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb;
		Meta.twitter = payload.twitter;

		if (payload.microdata) {
			Meta.microdata = payload.microdata;
		}

		if (game.value) {
			showCommentThreadModalFromPermalink(game.value, 'comments');
			permalinkWatchDeregister = watchForCommentThreadModalPermalink(game.value, 'comments');
		}

		feed.value = ActivityFeedService.routed(
			feed.value,
			{
				type: 'EventItem',
				name: 'game-devlog',
				url: `/web/posts/fetch/game/${game.value!.id}`,
				hideGameInfo: true,
				itemsPerPage: payload.perPage,
			},
			payload.posts,
			fromCache
		);

		trackExperimentEngagement(configGuestNoAuthRequired);
	},
	onDestroyed() {
		if (permalinkWatchDeregister) {
			permalinkWatchDeregister();
			permalinkWatchDeregister = undefined;
		}
	},
});

function showComments() {
	showCommentModal({ model: game.value!, displayMode: 'comments' });
}

function onPostAdded(post: FiresidePostModel) {
	ActivityFeedService.onPostAdded({
		feed: feed.value!,
		post,
		appRoute: appRoute,
		route: route,
	});
}

async function reloadPreviewComments() {
	if (game.value instanceof GameModel) {
		const $payload = await Api.sendRequest(
			'/web/discover/games/comment-overview/' + game.value.id
		);

		setOverviewComments(storeModelList(CommentModel, $payload.comments));
	}
}
</script>

<template>
	<AppShellPageBackdrop class="route-game-overview">
		<!-- Media Bar -->
		<AppGameMediaBar v-if="game?.media_count" :media-items="mediaItems" />

		<section class="section section-thin">
			<AppAdWidget
				v-if="globalShouldShowAds && !isMobile"
				unit-name="billboard"
				:style-override="{
					paddingBottom: `8px`,
					marginBottom: kLineHeightComputed.px,
					borderBottom: `${kBorderWidthSm.px} solid ${kThemeBgSubtle}`,
				}"
			/>

			<AppAdStickyRail show-left>
				<AppPageContainer xl>
					<template #left>
						<AppGameStatbar />

						<AppShareCard
							class="-share-card"
							resource="game"
							:url="shareLink ?? ''"
							bleed-padding
						/>

						<AppUserKnownFollowers
							v-if="isOverviewLoaded"
							:users="knownFollowers"
							:count="knownFollowerCount"
						/>

						<AppGameCommunityBadge v-if="game?.community" :community="game.community" />
					</template>

					<template v-if="!isMobile && game?.comments_enabled" #left-bottom>
						<div class="pull-right">
							<AppButton trans @click="showComments()">
								{{ $gettext(`View all`) }}
							</AppButton>
						</div>

						<h4 class="section-header">
							{{ $gettext(`Comments`) }}
							<small v-if="commentsCount > 0">
								({{ formatNumber(commentsCount) }})
							</small>
						</h4>

						<AppCommentAddButton
							v-if="shouldShowCommentAdd"
							:model="game"
							display-mode="comments"
						/>

						<AppCommentOverview
							:comments="overviewComments"
							:model="game"
							display-mode="comments"
							@reload-comments="reloadPreviewComments"
						/>
					</template>

					<template #right>
						<template v-if="globalShouldShowAds && !isMobile">
							<AppScrollAffix
								:style="{ position: `relative`, zIndex: kLayerAds }"
								:padding="isLg ? 80 : 8"
								:affixed-styles="styleWhen(screenWidth > 2300, { right: `8px` })"
							>
								<AppAdWidget
									unit-name="mpu"
									:style-override="{
										...styleChangeBg('bg'),
										...styleElevate(3),
										minWidth: `300px`,
										padding: `8px`,
										borderRadius: kBorderRadiusLg.px,
									}"
								/>
							</AppScrollAffix>
							<AppSpacer vertical :scale="4" />
						</template>

						<template v-if="!isMobile">
							<h4 class="section-header">
								{{ $gettext(`Recommended`) }}
							</h4>

							<AppGameListPlaceholder v-if="!isOverviewLoaded" :num="5" />
							<AppGameList v-else :games="recommendedGames" />
						</template>
					</template>

					<template #default>
						<!--
						Convenience Messaging
						This needs to be a div instead of a template or vue 2.4.4 complains about a
						patched vnode not existing.
						-->
						<div v-if="customGameMessages.length">
							<div
								v-if="game?.canceled"
								v-translate
								class="alert alert-notice full-bleed-xs"
							>
								This game was canceled, so the current version might be buggy or
								incomplete. You can still follow it if you'd like to be notified in
								the case that development continues.
							</div>

							<div
								v-for="(msg, i) of customGameMessages"
								:key="i"
								class="alert full-bleed-xs"
								:class="{
									'alert-notice': msg.type === 'alert',
								}"
							>
								<AppJolticon icon="notice" />
								<!-- eslint-disable-next-line vue/no-v-html -->
								<span v-html="msg.message" />
							</div>

							<br class="hidden-xs" />
						</div>

						<!--
						Builds / Soundtrack
						This is a bit tricky. _has_packages doesn't yet take into account private packages.
						If the game has only private packages, this will still be set to true.
						We only use it to figure out if we should show the releases section while loading before
						we actually have the package data. Because of that, we only use it to figure out what to
						show while we're loading the section. After it's loaded in, we decide if it should show
						through the "hasReleasesSection" variable which has the correct data.
						-->
						<template
							v-if="(game?._has_packages && !isOverviewLoaded) || hasReleasesSection"
						>
							<div id="game-releases">
								<div
									v-if="shouldShowMultiplePackagesMessage"
									class="alert alert-notice"
								>
									<AppJolticon icon="notice" />
									{{
										$gettext(
											`There are multiple packages for your device. Please choose one below.`
										)
									}}
								</div>

								<AppLazyPlaceholder :when="isOverviewLoaded">
									<div
										class="lazy-placeholder -package-placeholder"
										:style="{
											height: `135px`,
											marginBottom: kLineHeightComputed.px,
										}"
									/>

									<div v-if="externalPackages.length">
										<AppGameExternalPackageCard
											v-for="externalPackage of externalPackages"
											:key="`external-${externalPackage.id}`"
											:package="externalPackage"
										/>
									</div>

									<div v-if="packages.length">
										<AppGamePackageCard
											v-for="pkg of packages"
											:key="pkg.id"
											:game="game!"
											:sellable="pkg._sellable!"
											:package="pkg"
											:releases="pkg._releases"
											:builds="pkg._builds"
										/>
									</div>

									<!-- We want to key it by the game ID so that it resets completely when the page changes. -->
									<AppGameSoundtrackCard
										v-if="game && songs.length"
										:key="game.id"
										:game="game"
										:songs="songs"
									/>
								</AppLazyPlaceholder>
							</div>

							<AppDiscoverGamesViewOverviewSupporters
								v-if="supporters.length > 0"
								:supporters="supporters"
								:supporter-count="supporterCount"
							/>
						</template>

						<div class="sheet sheet-elevate">
							<div v-if="!isOverviewLoaded">
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" :style="{ width: `40%` }" />
							</div>
							<div v-else-if="game">
								<!-- Set a :key to let vue know that it should update this when the game changes. -->
								<AppFadeCollapse
									:key="game.description_content"
									:collapse-height="600"
									:is-open="showDetails || !postsCount"
									:animate="false"
									@require-change="setCanToggleDescription"
									@expand="toggleDetails()"
								>
									<AppContentViewer :source="game.description_content" />
								</AppFadeCollapse>

								<div v-if="showDetails">
									<hr />
									<div class="row">
										<div class="col-sm-6">
											<AppGameDetails />
										</div>
										<div class="col-sm-6">
											<AppLazyPlaceholder :when="isOverviewLoaded">
												<div
													class="lazy-placeholder"
													style="height: 115px"
												/>
												<AppGameOgrs :game="game" />
											</AppLazyPlaceholder>
										</div>
									</div>
								</div>

								<div class="page-cut page-cut-no-margin">
									<AppButton trans @click="toggleDetails()">
										{{
											!showDetails ? $gettext(`Show more`) : $gettext(`Less`)
										}}
									</AppButton>
								</div>
							</div>
						</div>

						<AppPostAddButton v-if="hasDevlogPerms" :game="game" @add="onPostAdded" />

						<AppActivityFeedPlaceholder v-if="!feed || !feed.isBootstrapped" />
						<template v-else>
							<AppActivityFeedLazy v-if="feed.hasItems" :feed="feed" show-ads />
							<div v-else class="alert">
								{{
									$gettext(
										`Nothing has been posted to this project page yet. Check back later!`
									)
								}}
							</div>
						</template>
					</template>
				</AppPageContainer>
			</AppAdStickyRail>
		</section>
	</AppShellPageBackdrop>
</template>
