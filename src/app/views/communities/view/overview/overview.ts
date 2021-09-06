import { Component, Inject, Watch } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Growls } from '../../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import AppCommunitySidebar from '../../../../components/community/sidebar/sidebar.vue';
import AppFiresideBadgeAdd from '../../../../components/fireside/badge/add/add.vue';
import { Store } from '../../../../store/index';
import { CommunitiesViewChannelDeps } from '../channel/channel';
import {
	acceptCollaboration,
	CommunityRouteStore,
	CommunityRouteStoreKey,
	declineCollaboration,
	setCommunityMeta,
} from '../view.store';
import { doFeedChannelPayload, resolveFeedChannelPayload } from '../_feed/feed-helpers';
import AppCommunitiesViewFeed from '../_feed/feed.vue';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';

@Component({
	name: 'RouteCommunitiesViewOverview',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunitySidebar,
		AppCommunitiesViewFeed,
		AppFiresideBadgeAdd,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: CommunitiesViewChannelDeps,
	resolver: ({ route }) => doFeedChannelPayload(route),
})
export default class RouteCommunitiesViewOverview extends BaseRouteComponent {
	@Inject(CommunityRouteStoreKey) routeStore!: CommunityRouteStore;

	@AppState user!: AppStore['user'];
	@State communities!: Store['communities'];
	@State communityStates!: Store['communityStates'];
	@Action joinCommunity!: Store['joinCommunity'];
	@State grid!: Store['grid'];

	feed: ActivityFeedView | null = null;
	finishedLoading = false;
	userFireside: Fireside | null = null;

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

		return this.$gettextInterpolate(
			`%{ name } Community - Fan art, videos, guides, polls and more`,
			{
				name: this.community.name,
			}
		);
	}

	get canAcceptCollaboration() {
		return this.community.is_member || (this.user && this.user.can_join_communities);
	}

	get acceptCollaborationTooltip() {
		return this.canAcceptCollaboration ? '' : this.$gettext(`You are in too many communities.`);
	}

	get canCreateFireside() {
		return !this.userFireside && this.community.allow_firesides;
	}

	@Watch('communityState.hasUnreadFeaturedPosts', { immediate: true })
	onChannelUnreadChanged() {
		if (this.feed && this.feed.newCount === 0 && this.communityState.hasUnreadFeaturedPosts) {
			this.feed.newCount = 1;
		}
	}

	routeCreated() {
		this.feed = ActivityFeedService.routeInit(this);
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

		if ($payload.fireside) {
			this.userFireside = new Fireside($payload.userFireside);
		}
	}

	loadedNew() {
		if (this.communityState.hasUnreadFeaturedPosts && this.user) {
			this.grid?.pushViewNotifications('community-featured', {
				communityId: this.community.id,
			});
		}
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.onPostAdded(this.feed!, post, this);
	}

	async acceptCollaboration() {
		if (!this.user) {
			return;
		}

		await acceptCollaboration(this.routeStore, this.user);
		this.joinCommunity({ community: this.community });
		Growls.success(this.$gettext(`You are now a collaborator on this community!`));
	}

	async declineCollaboration() {
		await declineCollaboration(this.routeStore);
	}
}
