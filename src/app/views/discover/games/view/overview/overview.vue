<script lang="ts">
import { setup } from 'vue-class-component';
import { Inject, Options } from 'vue-property-decorator';
import AppFadeCollapse from '../../../../../../_common/AppFadeCollapse.vue';
import { useAdsController } from '../../../../../../_common/ad/ad-store';
import AppAdWidget from '../../../../../../_common/ad/widget/AppAdWidget.vue';
import { Api } from '../../../../../../_common/api/api.service';
import AppCard from '../../../../../../_common/card/AppCard.vue';
import { Clipboard } from '../../../../../../_common/clipboard/clipboard-service';
import AppCommentAddButton from '../../../../../../_common/comment/add-button/add-button.vue';
import { Comment, canCommentOnModel } from '../../../../../../_common/comment/comment-model';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	getCommentStore,
} from '../../../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../../../_common/comment/modal/modal.service';
import {
	CommentThreadModal,
	CommentThreadModalPermalinkDeregister,
} from '../../../../../../_common/comment/thread/modal.service';
import AppContentViewer from '../../../../../../_common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '../../../../../../_common/environment/environment.service';
import { formatNumber } from '../../../../../../_common/filters/number';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import AppGameExternalPackageCard from '../../../../../../_common/game/external-package/card/card.vue';
import { Game } from '../../../../../../_common/game/game.model';
import AppGameMediaBar from '../../../../../../_common/game/media-bar/media-bar.vue';
import AppGamePackageCard from '../../../../../../_common/game/package/card/AppGamePackageCard.vue';
import AppGameSoundtrackCard from '../../../../../../_common/game/soundtrack/card/card.vue';
import { HistoryTick } from '../../../../../../_common/history-tick/history-tick-service';
import { AppLazyPlaceholder } from '../../../../../../_common/lazy/placeholder/placeholder';
import { Meta } from '../../../../../../_common/meta/meta-service';
import { PartnerReferral } from '../../../../../../_common/partner-referral/partner-referral-service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppShareCard from '../../../../../../_common/share/card/AppShareCard.vue';
import { getAbsoluteLink } from '../../../../../../utils/router';
import AppActivityFeedPlaceholder from '../../../../../components/activity/feed/AppActivityFeedPlaceholder.vue';
import { ActivityFeedService } from '../../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../../components/activity/feed/view';
import AppCommentOverview from '../../../../../components/comment/AppCommentOverview.vue';
import AppGameCommunityBadge from '../../../../../components/game/community-badge/community-badge.vue';
import AppGameList from '../../../../../components/game/list/list.vue';
import AppGameListPlaceholder from '../../../../../components/game/list/placeholder/placeholder.vue';
import AppGameOgrs from '../../../../../components/game/ogrs/ogrs.vue';
import { AppGamePerms } from '../../../../../components/game/perms/perms';
import { AppActivityFeedLazy } from '../../../../../components/lazy';
import AppPageContainer from '../../../../../components/page-container/AppPageContainer.vue';
import AppPostAddButton from '../../../../../components/post/add-button/AppPostAddButton.vue';
import AppShellPageBackdrop from '../../../../../components/shell/AppShellPageBackdrop.vue';
import AppUserKnownFollowers from '../../../../../components/user/known-followers/AppUserKnownFollowers.vue';
import { useGameRouteController } from '../view.vue';
import AppDiscoverGamesViewOverviewSupporters from './AppDiscoverGamesViewOverviewSupporters.vue';
import AppDiscoverGamesViewOverviewDetails from './_details/details.vue';
import AppDiscoverGamesViewOverviewStatbar from './_statbar/statbar.vue';

@Options({
	name: 'RouteDiscoverGamesViewOverview',
	components: {
		AppPageContainer,
		AppShellPageBackdrop,
		AppDiscoverGamesViewOverviewDetails,
		AppDiscoverGamesViewOverviewSupporters,
		AppDiscoverGamesViewOverviewStatbar,
		AppGameCommunityBadge,
		AppAdWidget,
		AppCard,
		AppFadeCollapse,
		AppLazyPlaceholder,
		AppGameOgrs,
		AppGameExternalPackageCard,
		AppGamePackageCard,
		AppGameSoundtrackCard,
		AppGameMediaBar,
		AppCommentAddButton,
		AppCommentOverview,
		AppActivityFeed: AppActivityFeedLazy,
		AppActivityFeedPlaceholder,
		AppPostAddButton,
		AppGamePerms,
		AppContentViewer,
		AppUserKnownFollowers,
		AppShareCard,
		AppGameListPlaceholder,
		AppGameList,
	},
})
@OptionsForLegacyRoute({
	lazy: true,
	cache: true,
	deps: { query: ['feed_last_id'] },
	resolver({ route }) {
		const gameId = parseInt(route.params.id as string);
		HistoryTick.sendBeacon('game-view', gameId, {
			sourceResource: 'Game',
			sourceResourceId: gameId,
		});

		// If we have a tracked partner "ref" in the URL, we want to pass that along
		// when gathering the payload.
		let apiOverviewUrl = '/web/discover/games/overview/' + route.params.id;

		const ref = PartnerReferral.getReferrer('Game', parseInt(route.params.id as string));
		if (ref) {
			apiOverviewUrl += '?ref=' + ref;
		}

		return Api.sendRequest(ActivityFeedService.makeFeedUrl(route, apiOverviewUrl));
	},
})
export default class RouteDiscoverGamesViewOverview extends LegacyRouteComponent {
	routeStore = setup(() => useGameRouteController()!);
	ads = setup(() => useAdsController());

	@Inject({ from: CommentStoreManagerKey })
	commentManager!: CommentStoreManager;

	feed: ActivityFeedView | null = null;

	permalinkWatchDeregister?: CommentThreadModalPermalinkDeregister;

	readonly Screen = Screen;
	readonly Environment = Environment;
	readonly formatNumber = formatNumber;

	get routeTitle() {
		if (this.game) {
			let title = this.$gettextInterpolate('%{ gameTitle } by %{ user }', {
				gameTitle: this.game.title,
				user: this.game.developer.display_name,
			});

			if (this.browserBuilds.length) {
				title += ' - ' + this.$gettext('Play Online');
			}

			return title;
		}
		return null;
	}

	get isOverviewLoaded() {
		return this.routeStore.isOverviewLoaded;
	}

	get game() {
		return this.routeStore.game;
	}

	get mediaItems() {
		return this.routeStore.mediaItems;
	}

	get overviewComments() {
		return this.routeStore.overviewComments;
	}

	get userRating() {
		return this.routeStore.userRating;
	}

	get songs() {
		return this.routeStore.songs;
	}

	get userPartnerKey() {
		return this.routeStore.userPartnerKey;
	}

	get partnerLink() {
		return this.routeStore.partnerLink;
	}

	get partner() {
		return this.routeStore.partner;
	}

	get partnerKey() {
		return this.routeStore.partnerKey;
	}

	get supporters() {
		return this.routeStore.supporters;
	}

	get supporterCount() {
		return this.routeStore.supporterCount;
	}

	get shouldShowMultiplePackagesMessage() {
		return this.routeStore.shouldShowMultiplePackagesMessage;
	}

	get postsCount() {
		return this.routeStore.postsCount;
	}

	get packages() {
		return this.routeStore.packages;
	}

	get externalPackages() {
		return this.routeStore.externalPackages;
	}

	get hasReleasesSection() {
		return this.routeStore.hasReleasesSection;
	}

	get customGameMessages() {
		return this.routeStore.customGameMessages;
	}

	get showDetails() {
		return this.routeStore.showDetails;
	}

	get browserBuilds() {
		return this.routeStore.browserBuilds;
	}

	get knownFollowers() {
		return this.routeStore.knownFollowers;
	}

	get knownFollowerCount() {
		return this.routeStore.knownFollowerCount;
	}

	get hasAnyPerms() {
		return Boolean(this.game?.hasPerms());
	}

	get hasDevlogPerms() {
		return Boolean(this.game?.hasPerms('devlogs'));
	}

	get hasPartnerControls() {
		return Boolean(this.game?.referrals_enabled && this.userPartnerKey && this.packages.length);
	}

	get commentsCount() {
		if (this.game) {
			const store = getCommentStore(this.commentManager, 'Game', this.game.id);
			return store ? store.totalCount : 0;
		}
		return 0;
	}

	get recommendedGames() {
		return this.routeStore.recommendedGames;
	}

	get shouldShowAds() {
		return this.ads.shouldShow;
	}

	get shouldShowCommentAdd() {
		return Boolean(this.game && canCommentOnModel(this.game));
	}

	get shareLink() {
		if (!this.game) {
			return undefined;
		}

		return getAbsoluteLink(this.$router, this.game.getUrl());
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this.isRouteBootstrapped);
	}

	routeResolved(payload: any, fromCache: boolean) {
		this.routeStore.processOverviewPayload(payload);

		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb;
		Meta.twitter = payload.twitter;

		if (payload.microdata) {
			Meta.microdata = payload.microdata;
		}

		if (this.game) {
			CommentThreadModal.showFromPermalink(this.$router, this.game, 'comments');
			this.permalinkWatchDeregister = CommentThreadModal.watchForPermalink(
				this.$router,
				this.game,
				'comments'
			);
		}

		this.feed = ActivityFeedService.routed(
			this.feed,
			{
				type: 'EventItem',
				name: 'game-devlog',
				url: `/web/posts/fetch/game/${this.game!.id}`,
				hideGameInfo: true,
				itemsPerPage: payload.perPage,
			},
			payload.posts,
			fromCache
		);
	}

	routeDestroyed() {
		if (this.permalinkWatchDeregister) {
			this.permalinkWatchDeregister();
			this.permalinkWatchDeregister = undefined;
		}
	}

	copyPartnerLink() {
		if (this.partnerLink) {
			Clipboard.copy(this.partnerLink);
		}
	}

	showComments() {
		CommentModal.show({ model: this.game!, displayMode: 'comments' });
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.onPostAdded({
			feed: this.feed!,
			post,
			appRoute: this.appRoute_,
			route: this.$route,
			router: this.$router,
		});
	}

	async reloadPreviewComments() {
		if (this.game instanceof Game) {
			const $payload = await Api.sendRequest(
				'/web/discover/games/comment-overview/' + this.game.id
			);

			this.routeStore.setOverviewComments(Comment.populate($payload.comments));
		}
	}
}
</script>

<template>
	<AppShellPageBackdrop class="route-game-overview">
		<!-- Media Bar -->
		<AppGameMediaBar v-if="game?.media_count" :media-items="mediaItems" />

		<section class="section section-thin">
			<AppAdWidget
				v-if="shouldShowAds && !Screen.isMobile"
				class="-leaderboard-ad"
				size="leaderboard"
				placement="top"
			/>

			<AppPageContainer xl>
				<template #left>
					<AppDiscoverGamesViewOverviewStatbar />

					<AppShareCard
						class="-share-card"
						resource="game"
						:url="shareLink"
						bleed-padding
					/>

					<AppUserKnownFollowers
						v-if="isOverviewLoaded"
						:users="knownFollowers"
						:count="knownFollowerCount"
					/>

					<AppGameCommunityBadge v-if="game?.community" :community="game.community" />
				</template>

				<template v-if="!Screen.isMobile && game?.comments_enabled" #left-bottom>
					<div class="pull-right">
						<AppButton trans @click="showComments()">
							<AppTranslate>View All</AppTranslate>
						</AppButton>
					</div>

					<h4 class="section-header">
						<AppTranslate>Comments</AppTranslate>
						<small v-if="commentsCount > 0">({{ formatNumber(commentsCount) }})</small>
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
					<AppAdWidget
						v-if="shouldShowAds && !Screen.isMobile"
						class="-recommended-ad"
						size="rectangle"
						placement="side"
					/>

					<template v-if="!Screen.isMobile">
						<h4 class="section-header">
							<AppTranslate>Recommended</AppTranslate>
						</h4>

						<AppGameListPlaceholder v-if="!isOverviewLoaded" :num="5" />
						<AppGameList v-else :games="recommendedGames" event-label="recommended" />
					</template>
				</template>

				<!--
					Convenience Messaging
					This needs to be a div instead of a template or vue 2.4.4 complains about a
					patched vnode not existing.
				-->
				<div v-if="customGameMessages.length">
					<div v-if="game?.canceled" v-translate class="alert alert-notice full-bleed-xs">
						This game was canceled, so the current version might be buggy or incomplete.
						You can still follow it if you'd like to be notified in the case that
						development continues.
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
				<template v-if="(game?._has_packages && !isOverviewLoaded) || hasReleasesSection">
					<div id="game-releases">
						<!--
							Partner Controls
						-->
						<AppCard v-if="hasPartnerControls">
							<div class="card-content">
								<p>
									<AppTranslate tag="strong">
										This game is part of the Partner system!
									</AppTranslate>
									<AppTranslate>
										You can use this link for sharing the game.
									</AppTranslate>
								</p>
								<input class="form-control" :value="partnerLink" />
							</div>
							<div class="card-controls">
								<AppButton primary @click="copyPartnerLink">
									<AppTranslate>Copy Partner Link</AppTranslate>
								</AppButton>
								<AppButton
									v-if="game"
									trans
									:to="{
										name: 'dash.analytics',
										params: { resource: 'Game', resourceId: game.id },
									}"
								>
									<AppTranslate>View Analytics</AppTranslate>
								</AppButton>
							</div>
						</AppCard>

						<div v-if="shouldShowMultiplePackagesMessage" class="alert alert-notice">
							<AppJolticon icon="notice" />
							<AppTranslate>
								There are multiple packages for your device. Please choose one
								below.
							</AppTranslate>
						</div>

						<AppLazyPlaceholder :when="isOverviewLoaded">
							<div
								class="lazy-placeholder -package-placeholder"
								style="height: 135px"
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
									:game="game"
									:sellable="pkg._sellable"
									:package="pkg"
									:releases="pkg._releases"
									:builds="pkg._builds"
									:is-partner="!!userPartnerKey"
									:partner-key="partnerKey"
									:partner="partner"
								/>
							</div>

							<!--
								We want to key it by the game ID so that it
								resets completely when the page changes.
							-->
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
						<span class="lazy-placeholder" style="width: 40%" />
					</div>
					<div v-else-if="game">
						<!--
							Set a :key to let vue know that it should update
							this when the game changes.
						-->
						<AppFadeCollapse
							:key="game.description_content"
							:collapse-height="600"
							:is-open="showDetails || !postsCount"
							:animate="false"
							@require-change="routeStore.setCanToggleDescription"
							@expand="routeStore.toggleDetails()"
						>
							<AppContentViewer :source="game.description_content" />
						</AppFadeCollapse>

						<div v-if="showDetails">
							<hr />
							<div class="row">
								<div class="col-sm-6">
									<AppDiscoverGamesViewOverviewDetails :game="game" />
								</div>
								<div class="col-sm-6">
									<AppLazyPlaceholder :when="isOverviewLoaded">
										<div class="lazy-placeholder" style="height: 115px" />
										<AppGameOgrs :game="game" />
									</AppLazyPlaceholder>
								</div>
							</div>
						</div>

						<div class="page-cut page-cut-no-margin">
							<AppButton
								v-app-track-event="`game-profile:show-full-description`"
								trans
								@click="routeStore.toggleDetails()"
							>
								<AppTranslate v-if="!showDetails">Show More</AppTranslate>
								<AppTranslate v-else>Less</AppTranslate>
							</AppButton>
						</div>
					</div>
				</div>

				<AppPostAddButton v-if="hasDevlogPerms" :game="game" @add="onPostAdded" />

				<AppActivityFeedPlaceholder v-if="!feed || !feed.isBootstrapped" />
				<template v-else>
					<AppActivityFeed v-if="feed.hasItems" :feed="feed" show-ads />
					<div v-else class="alert">
						<AppTranslate>
							Nothing has been posted to this project page yet. Maybe check back
							later!
						</AppTranslate>
					</div>
				</template>
			</AppPageContainer>
		</section>
	</AppShellPageBackdrop>
</template>

<style lang="stylus" scoped>
.-leaderboard-ad
	padding-bottom: 8px
	margin-bottom: $line-height-computed
	border-bottom: $border-width-small solid var(--theme-bg-subtle)

.-recommended-ad
	width: 300px
	margin-bottom: $line-height-computed

.-package-placeholder
	margin-bottom: $line-height-computed
</style>
