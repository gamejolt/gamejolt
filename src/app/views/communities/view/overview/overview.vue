<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Watch } from 'vue-property-decorator';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import AppCommunitySidebar from '../../../../components/community/sidebar/AppCommunitySidebar.vue';
import { useGridStore } from '../../../../components/grid/grid-store';
import { useAppStore } from '../../../../store/index';
import { doFeedChannelPayload, resolveFeedChannelPayload } from '../_feed/feed-helpers';
import AppCommunitiesViewFeed from '../_feed/feed.vue';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';
import { CommunitiesViewChannelDeps } from '../channel/channel.vue';
import {
	acceptCollaboration,
	declineCollaboration,
	setCommunityMeta,
	useCommunityRouteStore,
} from '../view.store';

@Options({
	name: 'RouteCommunitiesViewOverview',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunitySidebar,
		AppCommunitiesViewFeed,
		AppLoadingFade,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForLegacyRoute({
	cache: true,
	lazy: true,
	deps: CommunitiesViewChannelDeps,
	resolver: ({ route }) => doFeedChannelPayload(route),
})
export default class RouteCommunitiesViewOverview extends LegacyRouteComponent {
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	gridStore = setup(() => useGridStore());

	routeStore = setup(() => useCommunityRouteStore())!;

	get user() {
		return this.commonStore.user;
	}
	get communities() {
		return this.store.communities;
	}
	get communityStates() {
		return this.store.communityStates;
	}
	get grid() {
		return this.gridStore.grid;
	}

	feed: ActivityFeedView | null = null;
	finishedLoading = false;

	get community() {
		return this.routeStore.community;
	}

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get sidebarData() {
		return this.routeStore.sidebarData;
	}

	get collaboratorInvite() {
		// Just return the collaborator as an "invite" if it's not accepted yet.
		const { collaborator } = this.routeStore;
		return collaborator && !collaborator.isAccepted ? collaborator : null;
	}

	get routeTitle() {
		if (!this.community) {
			return null;
		}

		return this.$gettext(`%{ name } Community - Fan art, videos, guides, polls and more`, {
			name: this.community.name,
		});
	}

	get canAcceptCollaboration() {
		return this.community.is_member || (this.user && this.user.can_join_communities);
	}

	get acceptCollaborationTooltip() {
		return this.canAcceptCollaboration ? '' : this.$gettext(`You are in too many communities.`);
	}

	@Watch('communityState.hasUnreadFeaturedPosts', { immediate: true })
	onChannelUnreadChanged() {
		if (this.feed && this.feed.newCount === 0 && this.communityState.hasUnreadFeaturedPosts) {
			this.feed.newCount = 1;
		}
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this.isRouteBootstrapped);
		this.finishedLoading = false;
	}

	routeResolved($payload: any, fromCache: boolean) {
		this.feed = resolveFeedChannelPayload(
			this.feed,
			this.community,
			this.$route,
			$payload,
			fromCache
		);

		this.finishedLoading = true;

		if (this.routeTitle) {
			setCommunityMeta(this.community, this.routeTitle);
		}

		if (!fromCache && this.user) {
			this.grid?.pushViewNotifications('community-featured', {
				communityId: this.community.id,
			});
		}
	}

	loadedNew() {
		if (this.communityState.hasUnreadFeaturedPosts && this.user) {
			this.grid?.pushViewNotifications('community-featured', {
				communityId: this.community.id,
			});
		}
	}

	onPostAdded(post: FiresidePostModel) {
		ActivityFeedService.onPostAdded({
			feed: this.feed!,
			post,
			appRoute: this.appRoute_,
			route: this.$route,
			router: this.$router,
		});
	}

	async acceptCollaboration() {
		if (!this.user) {
			return;
		}

		await acceptCollaboration(this.routeStore, this.user);
		this.store.joinCommunity(this.community, { grid: this.grid });
		showSuccessGrowl(this.$gettext(`You are now a collaborator on this community!`));
	}

	async declineCollaboration() {
		await declineCollaboration(this.routeStore);
	}
}
</script>

<template>
	<div>
		<section v-if="collaboratorInvite" class="section section-thin fill-highlight">
			<div class="container text-center">
				<p>
					<b>
						<AppTranslate>
							You've been invited to collaborate on this community.
						</AppTranslate>
					</b>
				</p>
				<AppButton
					v-app-tooltip.bottom="acceptCollaborationTooltip"
					solid
					:disabled="!canAcceptCollaboration"
					@click="acceptCollaboration()"
				>
					<AppTranslate>Accept</AppTranslate>
				</AppButton>
				<AppButton solid @click="declineCollaboration()">
					<AppTranslate>Decline</AppTranslate>
				</AppButton>
			</div>
		</section>

		<AppCommunitiesViewPageContainer>
			<template #default>
				<AppCommunitiesViewFeed
					:feed="feed"
					@add-post="onPostAdded"
					@load-new="loadedNew"
				/>
			</template>
			<template #sidebar>
				<AppCommunitySidebar :sidebar-data="sidebarData" :community="community" />
			</template>
		</AppCommunitiesViewPageContainer>
	</div>
</template>
