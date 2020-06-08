import { Component, Inject } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { CommunityChannel } from '../../../../../_common/community/channel/channel.model';
import {
	Community,
	CommunityPresetChannelType,
} from '../../../../../_common/community/community.model';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { Game } from '../../../../../_common/game/game.model';
import { Growls } from '../../../../../_common/growls/growls.service';
import { Meta } from '../../../../../_common/meta/meta-service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppState, AppStore } from '../../../../../_common/store/app-store';
import { ThemeMutation, ThemeStore } from '../../../../../_common/theme/theme.store';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import { ActivityFeedService } from '../../../../components/activity/feed/feed-service';
import { ActivityFeedView } from '../../../../components/activity/feed/view';
import AppCommunitySidebar from '../../../../components/community/sidebar/sidebar.vue';
import AppPageHeader from '../../../../components/page-header/page-header.vue';
import { Store } from '../../../../store/index';
import { CommunitiesViewChannelDeps } from '../channel/channel';
import {
	acceptCollaboration,
	CommunityRouteStore,
	CommunityRouteStoreKey,
	declineCollaboration,
} from '../view.store';
import {
	doFeedChannelPayload,
	getFeedChannelSort,
	resolveFeedChannelPayload,
} from '../_feed/feed-helpers';
import AppCommunitiesViewFeed from '../_feed/feed.vue';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';

@Component({
	name: 'RouteCommunitiesViewOverview',
	components: {
		AppPageHeader,
		AppCommunitiesViewPageContainer,
		// AppNavTabList,
		// AppCommunitiesViewOverviewNavEdit,
		AppCommunitySidebar,
		// AppCommunityThumbnailImg,
		AppTimeAgo,
		AppCommunitiesViewFeed,
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
	@ThemeMutation setPageTheme!: ThemeStore['setPageTheme'];

	feed: ActivityFeedView | null = null;
	finishedLoading = false;

	readonly Screen = Screen;

	get community() {
		return this.routeStore.community;
	}

	get communityState() {
		return this.communityStates.getCommunityState(this.community);
	}

	get channel() {
		return this.routeStore.channelPath;
	}

	get sidebarData() {
		return this.routeStore.sidebarData;
	}

	get collaboratorInvite() {
		// Just return the collaborator as an "invite" if it's not accepted yet.
		const collab = this.routeStore.collaborator;
		return collab && !collab.isAccepted ? collab : null;
	}

	get routeTitle() {
		if (!this.community) {
			return null;
		}

		let title = this.$gettextInterpolate(
			`%{ name } Community - Fan art, videos, guides, polls and more`,
			{
				name: this.community.name,
			}
		);

		if (
			this.channel === CommunityPresetChannelType.FEATURED ||
			(this.sort !== 'hot' && this.sort !== 'new')
		) {
			return title;
		}

		if (this.channel === CommunityPresetChannelType.ALL) {
			switch (this.sort) {
				case 'hot':
					title = this.$gettext('Hot posts');
					break;
				case 'new':
					title = this.$gettext('New posts');
					break;
			}
		} else {
			switch (this.sort) {
				case 'hot':
					title = this.$gettextInterpolate('Hot %{ tag } posts', {
						tag: this.channel,
					});
					break;
				case 'new':
					title = this.$gettextInterpolate('New %{ tag } posts', {
						tag: this.channel,
					});
					break;
			}
		}

		title +=
			' - ' +
			this.$gettextInterpolate(`%{ name } Community on Game Jolt`, {
				name: this.community.name,
			});

		this.disableRouteTitleSuffix = true;
		return title;
	}

	get communityBlockReason() {
		if (!this.community.user_block) {
			return '';
		}

		const reason = this.community.user_block.reason;
		const reasons = {
			spam: this.$gettext('Spam'),
			'off-topic': this.$gettext('Off Topic'),
			abuse: this.$gettext('Offensive or insulting'),
			other: this.$gettext('Other'),
		} as { [reason: string]: string };
		if (reasons[reason]) {
			return reasons[reason];
		}
		return reason;
	}

	get sort() {
		return getFeedChannelSort(this.$route);
	}

	get canAcceptCollaboration() {
		return this.routeStore.community.is_member || (this.user && this.user.can_join_communities);
	}

	get acceptCollaborationTooltip() {
		return this.canAcceptCollaboration ? '' : this.$gettext(`You are in too many communities`);
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

		Meta.description = this.$gettextInterpolate(
			// tslint:disable-next-line:max-line-length
			`Welcome to the %{ name } community on Game Jolt! Find and explore %{ name } fan art, lets plays and catch up on the latest news and theories!`,
			{ name: this.community.name }
		);

		Meta.fb = {
			type: 'website',
			title: this.routeTitle,
			description: Meta.description,
			image: this.community.header ? this.community.header!.mediaserver_url : null,
		};

		Meta.twitter = {
			card: 'summary_large_image',
			title: this.routeTitle,
			description: Meta.description,
			image: this.community.header ? this.community.header!.mediaserver_url : null,
		};

		this.communityState.unreadFeatureCount = 0;
		this.finishedLoading = true;
	}

	onPostAdded(post: FiresidePost) {
		ActivityFeedService.onPostAdded(this.feed!, post, this);
	}

	onChannelsChanged(channels: CommunityChannel[]) {
		this.community.channels = channels;
	}

	onGamesChanged(games: Game[]) {
		this.community.games = games;
	}

	onDetailsChanged(community: Community) {
		this.community.assign(community);
		this.setPageTheme(community.theme || null);
	}

	async acceptCollaboration() {
		if (!this.user) {
			return;
		}

		await acceptCollaboration(this.routeStore, this.user);
		this.joinCommunity(this.community);
		Growls.success(this.$gettext(`You are now a collaborator on this community!`));
	}

	async declineCollaboration() {
		await declineCollaboration(this.routeStore);
	}
}
