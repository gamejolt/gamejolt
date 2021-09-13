import { Component, Inject, InjectReactive, Watch } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { trackExperimentEngagement } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import AppCommentAddButton from '../../../../_common/comment/add-button/add-button.vue';
import { Comment } from '../../../../_common/comment/comment-model';
import {
	CommentStoreManager,
	CommentStoreManagerKey,
	CommentStoreModel,
	lockCommentStore,
	releaseCommentStore,
	setCommentCount,
} from '../../../../_common/comment/comment-store';
import { CommentModal } from '../../../../_common/comment/modal/modal.service';
import {
	CommentThreadModal,
	CommentThreadModalPermalinkDeregister,
} from '../../../../_common/comment/thread/modal.service';
import { Community } from '../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/img/img.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/verified-tick.vue';
import { configShareCard } from '../../../../_common/config/config.service';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import AppExpand from '../../../../_common/expand/expand.vue';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import { number } from '../../../../_common/filters/number';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { Game } from '../../../../_common/game/game.model';
import '../../../../_common/lazy/placeholder/placeholder.styl';
import { LinkedAccount, Provider } from '../../../../_common/linked-account/linked-account.model';
import { Meta } from '../../../../_common/meta/meta-service';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { BaseRouteComponent, RouteResolver } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppShareCard from '../../../../_common/share/card/card.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { UserFriendship } from '../../../../_common/user/friendship/friendship.model';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';
import { unfollowUser, User } from '../../../../_common/user/user.model';
import { ChatStore, ChatStoreKey } from '../../../components/chat/chat-store';
import { enterChatRoom } from '../../../components/chat/client';
import AppCommentOverview from '../../../components/comment/overview/overview.vue';
import AppFiresideBadge from '../../../components/fireside/badge/badge.vue';
import AppGameList from '../../../components/game/list/list.vue';
import AppGameListPlaceholder from '../../../components/game/list/placeholder/placeholder.vue';
import AppPageContainer from '../../../components/page-container/page-container.vue';
import { TrophyModal } from '../../../components/trophy/modal/modal.service';
import AppTrophyThumbnail from '../../../components/trophy/thumbnail/thumbnail.vue';
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
		AppTrophyThumbnail,
		AppFiresideBadge,
		AppShareCard,
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
	@InjectReactive(ChatStoreKey) chatStore!: ChatStore;
	@Inject(CommentStoreManagerKey) commentManager!: CommentStoreManager;

	@State
	app!: Store['app'];

	@State
	grid!: Store['grid'];

	@RouteStoreModule.State
	user!: RouteStore['user'];

	@RouteStoreModule.State
	isOverviewLoaded!: RouteStore['isOverviewLoaded'];

	@RouteStoreModule.State
	gamesCount!: RouteStore['gamesCount'];

	@RouteStoreModule.State
	communitiesCount!: RouteStore['communitiesCount'];

	@RouteStoreModule.State
	placeholderCommunitiesCount!: RouteStore['placeholderCommunitiesCount'];

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

	@RouteStoreModule.State
	previewTrophies!: RouteStore['previewTrophies'];

	@RouteStoreModule.State
	trophyCount!: RouteStore['trophyCount'];

	@Action
	toggleLeftPane!: Store['toggleLeftPane'];

	commentStore: CommentStoreModel | null = null;

	showFullDescription = false;
	canToggleDescription = false;
	showAllCommunities = false;
	isLoadingAllCommunities = false;
	games: Game[] = [];
	communities: Community[] = [];
	allCommunities: Community[] | null = null;
	overviewComments: Comment[] = [];
	linkedAccounts: LinkedAccount[] = [];
	knownFollowers: User[] = [];
	knownFollowerCount = 0;
	fireside: Fireside | null = null;

	permalinkWatchDeregister?: CommentThreadModalPermalinkDeregister;

	readonly User = User;
	readonly UserFriendship = UserFriendship;
	readonly Screen = Screen;

	get chat() {
		return this.chatStore.chat;
	}

	get routeTitle() {
		if (this.user) {
			return `${this.user.display_name} (@${this.user.username})`;
		}
		return null;
	}

	get useShareCard() {
		return configShareCard.value && !this.ignoringSplitTest;
	}

	get ignoringSplitTest() {
		return Screen.isMobile;
	}

	get shareUrl() {
		if (!this.user) {
			return Environment.baseUrl;
		}

		return Environment.baseUrl + this.user.url;
	}

	get canAddAsFriend() {
		return (
			this.app.user &&
			this.user &&
			this.user.id !== this.app.user.id &&
			!this.userFriendship &&
			this.user.friend_requests_enabled &&
			!this.user.is_blocked &&
			!this.user.blocked_you
		);
	}

	get hasQuickButtonsSection() {
		return this.canAddAsFriend || this.canMessage || (Screen.isMobile && this.gamesCount > 0);
	}

	get hasLinksSection() {
		return (
			this.user &&
			((this.linkedAccounts && this.linkedAccounts.length > 0) || this.user.web_site)
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
		return this.isLoadingAllCommunities
			? this.communitiesCount
			: this.placeholderCommunitiesCount;
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

	get shouldShowTrophies() {
		return !Screen.isMobile && !!this.previewTrophies && this.previewTrophies.length > 0;
	}

	get shouldShowMoreTrophies() {
		return this.shouldShowTrophies && this.trophyCount > this.previewTrophies!.length;
	}

	get moreTrophyCount() {
		return this.trophyCount - (this.previewTrophies || []).length;
	}

	get shouldShowShoutAdd() {
		return this.user && this.user.canComment;
	}

	get userBlockedYou() {
		return this.user && this.user.blocked_you;
	}

	get shouldShowFireside() {
		return this.fireside && this.fireside.canJoin();
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
		this.linkedAccounts = [];
		this.overviewComments = [];
	}

	routeResolved($payload: any) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb || {};
		Meta.fb.title = this.routeTitle;
		Meta.twitter = $payload.twitter || {};
		Meta.twitter.title = this.routeTitle;

		// Release the CommentStore if there was one left over.
		this.clearCommentStore();

		this.showFullDescription = false;
		this.showAllCommunities = false;
		this.isLoadingAllCommunities = false;
		this.games = Game.populate($payload.developerGamesTeaser);
		this.communities = Community.populate($payload.communities);
		this.linkedAccounts = LinkedAccount.populate($payload.linkedAccounts);
		this.overviewComments = Comment.populate($payload.comments);

		if (this.user) {
			CommentThreadModal.showFromPermalink(this.$router, this.user, 'shouts');
			this.permalinkWatchDeregister = CommentThreadModal.watchForPermalink(
				this.$router,
				this.user,
				'shouts'
			);

			// Initialize a CommentStore lock for profile shouts.
			this.commentStore = lockCommentStore(this.commentManager, 'User', this.user.id);
			setCommentCount(this.commentStore, this.user.comment_count);
		}

		if ($payload.knownFollowers) {
			this.knownFollowers = User.populate($payload.knownFollowers);
		}
		if ($payload.knownFollowerCount) {
			this.knownFollowerCount = $payload.knownFollowerCount;
		}
		if ($payload.fireside) {
			this.fireside = new Fireside($payload.fireside);
		}

		this.overviewPayload($payload);
	}

	destroyed() {
		this.clearCommentStore();
		if (this.permalinkWatchDeregister) {
			this.permalinkWatchDeregister();
			this.permalinkWatchDeregister = undefined;
		}
	}

	clearCommentStore() {
		if (this.commentStore) {
			releaseCommentStore(this.commentManager, this.commentStore);
			this.commentStore = null;
		}
	}

	showComments() {
		if (this.user) {
			CommentModal.show({
				model: this.user,
				displayMode: 'shouts',
			});
		}
	}

	openMessaging() {
		if (this.user && this.chat) {
			const chatUser = this.chat.friendsList.collection.find(u => u.id === this.user!.id);
			if (chatUser) {
				if (Screen.isXs) {
					this.toggleLeftPane('chat');
				}
				enterChatRoom(this.chat, chatUser.room_id);
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

	onClickTrophy(userTrophy: UserBaseTrophy) {
		TrophyModal.show(userTrophy);
	}

	async onClickUnfollow() {
		if (this.user) {
			const result = await ModalConfirm.show(
				this.$gettext(`Are you sure you want to unfollow this user?`),
				this.$gettext(`Unfollow user?`)
			);

			if (!result) {
				return;
			}

			unfollowUser(this.user);
		}
	}

	async onFriendRequestAccept() {
		await this.acceptFriendRequest();

		this.grid?.pushViewNotifications('friend-requests');
	}

	async onFriendRequestReject() {
		const rejected = await this.rejectFriendRequest();

		if (rejected) {
			this.grid?.pushViewNotifications('friend-requests');
		}
	}

	@Watch('ignoringSplitTest', { immediate: true })
	trackExperiment() {
		if (this.ignoringSplitTest) {
			return;
		}
		trackExperimentEngagement(configShareCard);
	}
}
