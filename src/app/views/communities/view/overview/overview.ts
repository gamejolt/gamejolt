import { setup } from 'vue-class-component';
import { Inject, Options, Watch } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../utils/array';
import { canCreateFiresides } from '../../../../../_common/community/community.model';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import AppCommunitySidebar from '../../../../components/community/sidebar/sidebar.vue';
import AppFiresideAvatarAdd from '../../../../components/fireside/avatar/add/add.vue';
import { FiresideAvatarEvent } from '../../../../components/fireside/avatar/avatar';
import AppFiresideAvatar from '../../../../components/fireside/avatar/avatar.vue';
import { useAppStore } from '../../../../store/index';
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

@Options({
	name: 'RouteCommunitiesViewOverview',
	components: {
		AppCommunitiesViewPageContainer,
		AppCommunitySidebar,
		AppCommunitiesViewFeed,
		AppFiresideAvatar,
		AppFiresideAvatarAdd,
		AppLoadingFade,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: CommunitiesViewChannelDeps,
	resolver: ({ route }) => doFeedChannelPayload(route),
})
export default class RouteCommunitiesViewOverview extends BaseRouteComponent {
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());

	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

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
		return this.store.grid;
	}

	feed: ActivityFeedView | null = null;
	finishedLoading = false;
	previewFiresides: Fireside[] = [];
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
		return canCreateFiresides(this.community);
	}

	get firesidesGridColumns() {
		return 5;
	}

	get firesidesGridStyling() {
		return {
			gridTemplateColumns: `repeat(${this.firesidesGridColumns}, 1fr)`,
		};
	}

	get displayablePreviewFiresides() {
		const perRow = this.firesidesGridColumns - (this.canCreateFireside ? 1 : 0);
		return Object.freeze(this.previewFiresides.slice(0, perRow));
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

		if ($payload.userFireside) {
			this.userFireside = new Fireside($payload.userFireside);
		}

		if ($payload.previewFiresides) {
			this.previewFiresides = Fireside.populate($payload.previewFiresides);
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
		this.store.joinCommunity(this.community);
		showSuccessGrowl(this.$gettext(`You are now a collaborator on this community!`));
	}

	async declineCollaboration() {
		await declineCollaboration(this.routeStore);
	}

	onFiresideEject({ fireside, community }: FiresideAvatarEvent) {
		if (community.community.id !== this.community.id) {
			return;
		}
		arrayRemove(this.previewFiresides, i => i === fireside);
	}
}
