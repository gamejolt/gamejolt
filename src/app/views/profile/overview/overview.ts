import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppCommentAddButton from 'game-jolt-frontend-lib/components/comment/add-button/add-button.vue';
import { Comment } from 'game-jolt-frontend-lib/components/comment/comment-model';
import { CommentModal } from 'game-jolt-frontend-lib/components/comment/modal/modal.service';
import { CommentThreadModal } from 'game-jolt-frontend-lib/components/comment/thread/modal.service';
import AppContentViewer from 'game-jolt-frontend-lib/components/content/content-viewer/content-viewer.vue';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import 'game-jolt-frontend-lib/components/lazy/placeholder/placeholder.styl';
import {
	LinkedAccount,
	Provider,
} from 'game-jolt-frontend-lib/components/linked-account/linked-account.model';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { UserFriendship } from 'game-jolt-frontend-lib/components/user/friendship/friendship.model';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { YoutubeChannel } from 'game-jolt-frontend-lib/components/youtube/channel/channel-model';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import { Component } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
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
		AppGameList,
		AppGameListPlaceholder,
		AppCommentAddButton,
		AppCommentOverview,
		AppContentViewer,
		AppUserKnownFollowers,
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
	games: Game[] = [];
	overviewComments: Comment[] = [];
	developerGames: Game[] = [];
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
		this.games = [];
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
		this.youtubeChannels = YoutubeChannel.populate($payload.youtubeChannels);
		this.games = Game.populate($payload.developerGamesTeaser);
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
