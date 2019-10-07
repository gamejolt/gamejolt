import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Api } from '../../../../_common/api/api.service';
import AppCommentAddButton from '../../../../_common/comment/add-button/add-button.vue';
import { Comment } from '../../../../_common/comment/comment-model';
import { CommentModal } from '../../../../_common/comment/modal/modal.service';
import { CommentThreadModal } from '../../../../_common/comment/thread/modal.service';
import { Community } from '../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/verified-tick.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import AppExpand from '../../../../_common/expand/expand.vue';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import { number } from '../../../../_common/filters/number';
import { Game } from '../../../../_common/game/game.model';
import '../../../../_common/lazy/placeholder/placeholder.styl';
import { LinkedAccount, Provider } from '../../../../_common/linked-account/linked-account.model';
import { Meta } from '../../../../_common/meta/meta-service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppTooltip } from '../../../../_common/tooltip/tooltip';
import { UserFriendship } from '../../../../_common/user/friendship/friendship.model';
import { User } from '../../../../_common/user/user.model';
import { YoutubeChannel } from '../../../../_common/youtube/channel/channel-model';
import { ChatClient } from '../../../components/chat/client';
import AppCommentOverview from '../../../components/comment/overview/overview.vue';
import AppGameList from '../../../components/game/list/list.vue';
import AppGameListPlaceholder from '../../../components/game/list/placeholder/placeholder.vue';
import AppPageContainer from '../../../components/page-container/page-container.vue';
import AppUserKnownFollowers from '../../../components/user/known-followers/known-followers.vue';
import { Store } from '../../../store/index';
import { RouteStore, RouteStoreModule } from '../profile.store';

@Component({
	name: 'RouteProfileOverview',
	components: {
		AppPageContainer,
		AppExpand,
		AppFadeCollapse,
		AppCommunityThumbnailImg,
		AppGameList,
		AppGameListPlaceholder,
		AppCommentAddButton,
		AppCommentOverview,
		AppContentViewer,
		AppUserKnownFollowers,
		AppCommunityVerifiedTick,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/profile/overview/@' + route.params.username),
})
export default class RouteProfileOverview extends BaseRouteComponent {
	@State
	app!: Store['app'];

	@RouteStoreModule.State
	user!: RouteStore['user'];

	@RouteStoreModule.State
	isOverviewLoaded!: RouteStore['isOverviewLoaded'];

	@RouteStoreModule.State
	gamesCount!: RouteStore['gamesCount'];

	@RouteStoreModule.State
	communitiesCount!: RouteStore['communitiesCount'];

	@RouteStoreModule.State
	videosCount!: RouteStore['videosCount'];

	@RouteStoreModule.State
	userFriendship!: RouteStore['userFriendship'];

	@RouteStoreModule.Mutation
	overviewPayload!: RouteStore['overviewPayload'];

	@RouteStoreModule.Action
	sendFriendRequest!: RouteStore['sendFriendRequest'];

	@RouteStoreModule.Action
	acceptFriendRequest!: RouteStore['acceptFriendRequest'];

	@RouteStoreModule.Action
	cancelFriendRequest!: RouteStore['cancelFriendRequest'];

	@RouteStoreModule.Action
	rejectFriendRequest!: RouteStore['rejectFriendRequest'];

	@RouteStoreModule.Action
	removeFriend!: RouteStore['removeFriend'];

	@Action
	toggleRightPane!: Store['toggleRightPane'];

	@State
	chat?: ChatClient;

	showFullDescription = false;
	canToggleDescription = false;
	showAllCommunities = false;
	isLoadingAllCommunities = false;
	games: Game[] = [];
	communities: Community[] = [];
	allCommunities: Community[] | null = null;
	overviewComments: Comment[] = [];
	youtubeChannels: YoutubeChannel[] = [];
	linkedAccounts: LinkedAccount[] = [];
	knownFollowers: User[] = [];
	knownFollowerCount = 0;

	readonly User = User;
	readonly UserFriendship = UserFriendship;
	readonly Screen = Screen;

	get routeTitle() {
		if (this.user) {
			return `${this.user.display_name} (@${this.user.username})`;
		}
		return null;
	}

	get canAddAsFriend() {
		return (
			this.app.user &&
			this.user &&
			this.user.id !== this.app.user.id &&
			!this.userFriendship &&
			this.user.friend_requests_enabled
		);
	}

	get hasQuickButtonsSection() {
		return (
			this.canAddAsFriend ||
			this.canMessage ||
			(Screen.isMobile && (this.gamesCount > 0 || this.videosCount > 0))
		);
	}

	get hasLinksSection() {
		return (
			this.user &&
			(this.youtubeChannels.length > 0 ||
				(this.linkedAccounts && this.linkedAccounts.length > 0) ||
				this.user.web_site)
		);
	}

	get hasGamesSection() {
		return !Screen.isMobile && this.gamesCount > 0;
	}

	get hasCommunitiesSection() {
		return !Screen.isMobile && this.communitiesCount > 0;
	}

	get twitterAccount() {
		return this.getLinkedAccount(LinkedAccount.PROVIDER_TWITTER);
	}

	get googleAccount() {
		return this.getLinkedAccount(LinkedAccount.PROVIDER_GOOGLE);
	}

	get twitchAccount() {
		return this.getLinkedAccount(LinkedAccount.PROVIDER_TWITCH);
	}

	get tumblrAccount() {
		const account = this.getLinkedAccount(LinkedAccount.PROVIDER_TUMBLR);
		if (account && account.tumblrSelectedBlog) {
			return account;
		}
		return null;
	}

	get mixerAccount() {
		return this.getLinkedAccount(LinkedAccount.PROVIDER_MIXER);
	}

	get addCommentPlaceholder() {
		if (!this.user) {
			return undefined;
		}

		if (this.app.user && this.user.id === this.app.user.id) {
			return this.$gettext('Shout at yourself!');
		} else {
			return this.$gettext('Shout') + ' @' + this.user.username + '!';
		}
	}

	get commentsCount() {
		if (this.user && this.user.comment_count) {
			return this.user.comment_count;
		}
		return 0;
	}

	get shouldShowShouts() {
		return this.user && !Screen.isMobile && this.user.shouts_enabled;
	}

	get isFriend() {
		return this.userFriendship && this.userFriendship.state === UserFriendship.STATE_FRIENDS;
	}

	get canMessage() {
		return this.isFriend && this.chat && this.chat.connected;
	}

	get previewCommunityCount() {
		return this.isLoadingAllCommunities ? this.communitiesCount : 4;
	}

	get canShowMoreCommunities() {
		return this.communitiesCount > this.communities.length;
	}

	get shownCommunities() {
		return this.showAllCommunities && this.allCommunities
			? this.allCommunities
			: this.communities;
	}

	get shouldShowKnownFollowers() {
		return (
			!!this.app.user &&
			!!this.user &&
			this.isOverviewLoaded &&
			this.app.user.id !== this.user.id
		);
	}

	getLinkedAccount(provider: Provider) {
		if (
			this.user &&
			this.linkedAccounts &&
			this.linkedAccounts.some(i => i.provider === provider)
		) {
			const account = this.linkedAccounts.find(i => i.provider === provider);
			if (account) {
				return account;
			}
		}
		return null;
	}

	routeCreated() {
		this.showFullDescription = false;
		this.showAllCommunities = false;
		this.isLoadingAllCommunities = false;
		this.games = [];
		this.communities = [];
		this.allCommunities = null;
		this.youtubeChannels = [];
		this.linkedAccounts = [];
		this.overviewComments = [];
	}

	routeResolved($payload: any) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb || {};
		Meta.fb.title = this.routeTitle;
		Meta.twitter = $payload.twitter || {};
		Meta.twitter.title = this.routeTitle;

		this.showFullDescription = false;
		this.showAllCommunities = false;
		this.isLoadingAllCommunities = false;
		this.youtubeChannels = YoutubeChannel.populate($payload.youtubeChannels);
		this.games = Game.populate($payload.developerGamesTeaser);
		this.communities = Community.populate($payload.communities);
		this.linkedAccounts = LinkedAccount.populate($payload.linkedAccounts);
		this.overviewComments = Comment.populate($payload.comments);

		if (this.user) {
			CommentThreadModal.showFromPermalink(this.$router, 'User', this.user.id, 'shouts');
		}

		if ($payload.knownFollowers) {
			this.knownFollowers = User.populate($payload.knownFollowers);
		}
		if ($payload.knownFollowerCount) {
			this.knownFollowerCount = $payload.knownFollowerCount;
		}

		this.overviewPayload($payload);
	}

	showComments() {
		if (this.user) {
			CommentModal.show({
				resource: 'User',
				resourceId: this.user.id,
				displayMode: 'shouts',
			});
		}
	}

	openMessaging() {
		if (this.user && this.chat) {
			const chatUser = this.chat.friendsList.collection.find(u => u.id === this.user!.id);
			if (chatUser) {
				if (this.chat.isInRoom(chatUser.roomId)) {
					this.toggleRightPane();
				} else {
					this.chat.enterRoom(chatUser.roomId);
				}
			}
		}
	}

	async toggleShowAllCommunities() {
		if (!this.user) {
			return;
		}

		if (this.isLoadingAllCommunities) {
			return;
		}

		this.showAllCommunities = !this.showAllCommunities;
		if (this.showAllCommunities && this.allCommunities === null) {
			this.isLoadingAllCommunities = true;

			try {
				const payload = await Api.sendRequest(
					`/web/profile/communities/@${this.user.username}`,
					null,
					{ detach: true }
				);
				this.allCommunities = Community.populate(payload.communities);
			} catch (e) {
				console.error(`Failed to load all communities for user ${this.user.id}`);
				console.error(e);
				this.showAllCommunities = false;
			} finally {
				this.isLoadingAllCommunities = false;
			}
		}
	}

	async reloadPreviewComments() {
		if (this.user) {
			const $payload = await Api.sendRequest(
				'/web/profile/comment-overview/@' + this.user.username
			);
			this.overviewComments = Comment.populate($payload.comments);
			this.user.comment_count = $payload.count;
		}
	}
}
