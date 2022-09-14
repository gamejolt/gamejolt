<script lang="ts">
import { setup } from 'vue-class-component';
import { Inject, Options } from 'vue-property-decorator';
import { removeQuery } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
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
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/verified-tick.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { Game } from '../../../../_common/game/game.model';
import '../../../../_common/lazy/placeholder/placeholder.styl';
import { LinkedAccount, Provider } from '../../../../_common/linked-account/linked-account.model';
import { Meta } from '../../../../_common/meta/meta-service';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { showUserFiresideFollowModal } from '../../../../_common/user/fireside/modal/follow-modal.service';
import { UserFriendship } from '../../../../_common/user/friendship/friendship.model';
import { showUserInviteFollowModal } from '../../../../_common/user/invite/modal/modal.service';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';
import { unfollowUser, User } from '../../../../_common/user/user.model';
import { enterChatRoom } from '../../../components/chat/client';
import AppCommentOverview from '../../../components/comment/overview/overview.vue';
import AppFiresideBadge from '../../../components/fireside/badge/badge.vue';
import AppGameList from '../../../components/game/list/list.vue';
import AppGameListPlaceholder from '../../../components/game/list/placeholder/placeholder.vue';
import { useGridStore } from '../../../components/grid/grid-store';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import { TrophyModal } from '../../../components/trophy/modal/modal.service';
import AppTrophyThumbnail from '../../../components/trophy/thumbnail/thumbnail.vue';
import AppUserKnownFollowers from '../../../components/user/known-followers/AppUserKnownFollowers.vue';
import { useAppStore } from '../../../store/index';
import { useProfileRouteController } from '../profile.vue';

const FiresideScrollInviewConfig = new ScrollInviewConfig({
	emitsOn: 'partial-overlap',
	trackFocused: false,
});

@Options({
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
		AppScrollInview,
		AppAspectRatio,
		AppShellPageBackdrop,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForRoute({
	cache: true,
	lazy: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest('/web/profile/overview/@' + route.params.username),
})
export default class RouteProfileOverview extends BaseRouteComponent {
	routeStore = setup(() => useProfileRouteController()!);
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	gridStore = setup(() => useGridStore());

	@Inject({ from: CommentStoreManagerKey })
	commentManager!: CommentStoreManager;

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
	hadInitialFireside = false;
	isFiresideInview = false;
	firesideHasVideo = false;
	maintainFiresideOutviewSpace = false;

	permalinkWatchDeregister?: CommentThreadModalPermalinkDeregister;

	readonly User = User;
	readonly UserFriendship = UserFriendship;
	readonly Screen = Screen;
	readonly formatNumber = formatNumber;
	readonly FiresideScrollInviewConfig = FiresideScrollInviewConfig;

	get app() {
		return this.commonStore;
	}

	get grid() {
		return this.gridStore.grid;
	}

	get user() {
		return this.routeStore.user;
	}

	get isOverviewLoaded() {
		return this.routeStore.isOverviewLoaded;
	}

	get gamesCount() {
		return this.routeStore.gamesCount;
	}

	get communitiesCount() {
		return this.routeStore.communitiesCount;
	}

	get placeholderCommunitiesCount() {
		return this.routeStore.placeholderCommunitiesCount;
	}

	get userFriendship() {
		return this.routeStore.userFriendship;
	}

	get previewTrophies() {
		return this.routeStore.previewTrophies;
	}

	get trophyCount() {
		return this.routeStore.trophyCount;
	}

	get chat() {
		return this.grid?.chat;
	}

	get routeTitle() {
		if (this.user) {
			return `${this.user.display_name} (@${this.user.username})`;
		}
		return null;
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
		// Keep the FiresideBadge around so we don't mess with their scroll
		// position when a fireside expires.
		return (!!this.fireside && this.fireside.canJoin()) || this.hadInitialFireside;
	}

	get canShowFiresidePreview() {
		return (
			this.shouldShowFireside &&
			(this.isFiresideInview ? this.firesideHasVideo : this.maintainFiresideOutviewSpace)
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
		this.linkedAccounts = [];
		this.overviewComments = [];
	}

	routeResolved(payload: any) {
		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb || {};
		Meta.fb.title = this.routeTitle;
		Meta.twitter = payload.twitter || {};
		Meta.twitter.title = this.routeTitle;

		// Release the CommentStore if there was one left over.
		this.clearCommentStore();

		this.showFullDescription = false;
		this.showAllCommunities = false;
		this.isLoadingAllCommunities = false;
		this.games = Game.populate(payload.developerGamesTeaser);
		this.communities = Community.populate(payload.communities);
		this.linkedAccounts = LinkedAccount.populate(payload.linkedAccounts);
		this.overviewComments = Comment.populate(payload.comments);

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

			// They came from an invite link.
			if (this.$route.query['invite'] !== undefined) {
				// Only show the modal if they're not following yet.
				if (!this.user.is_following) {
					showUserInviteFollowModal(this.user);
				}

				removeQuery(this.$router, 'invite');
			}

			// They came from a /fireside/@user link, but they're not streaming.
			if (this.$route.query['fireside'] !== undefined) {
				showUserFiresideFollowModal(this.user);
				removeQuery(this.$router, 'fireside');
			}
		}

		if (payload.knownFollowers) {
			this.knownFollowers = User.populate(payload.knownFollowers);
		}
		if (payload.knownFollowerCount) {
			this.knownFollowerCount = payload.knownFollowerCount;
		}

		this.fireside = payload.fireside ? new Fireside(payload.fireside) : null;
		this.hadInitialFireside = !!this.fireside;

		this.routeStore.overviewPayload(payload);
	}

	routeDestroyed() {
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
					this.store.toggleLeftPane('chat');
				}
				enterChatRoom(this.chat, chatUser.room_id);
			}
		}
	}

	onFiresideInview() {
		this.isFiresideInview = true;
		this.maintainFiresideOutviewSpace = false;
	}

	onFiresideOutview() {
		this.maintainFiresideOutviewSpace = this.canShowFiresidePreview;
		this.isFiresideInview = false;
	}

	onFiresideBadgeChanged(hasVideo: boolean, _isStreaming: boolean) {
		this.firesideHasVideo = hasVideo;
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
		await this.routeStore.acceptFriendRequest();

		this.grid?.pushViewNotifications('friend-requests');
	}

	async onFriendRequestReject() {
		const rejected = await this.routeStore.rejectFriendRequest();

		if (rejected) {
			this.grid?.pushViewNotifications('friend-requests');
		}
	}
}
</script>

<template>
	<div v-if="user">
		<!--
			If this user is banned, we show very little.
		-->
		<section v-if="!user.status" class="section fill-notice">
			<div class="container">
				<h2 class="-banned-header">
					<AppTranslate>This account is banned.</AppTranslate>
				</h2>

				<AppExpand :when="isFriend">
					<p>
						<strong><AppTranslate>This user was your friend.</AppTranslate></strong>
						<br />
						<AppTranslate>
							If you remove them from your friends list, you will no longer be able to
							access your chat history with them.
						</AppTranslate>
					</p>

					<AppButton solid @click="routeStore.removeFriend()">
						<AppTranslate>Remove Friend</AppTranslate>
					</AppButton>
				</AppExpand>

				<AppExpand :when="user.is_following">
					<!-- Create some padding -->
					<template v-if="isFriend">
						<br />
						<br />
					</template>

					<p>
						<strong><AppTranslate>You were following this user.</AppTranslate></strong>
						<br />
						<AppTranslate>
							If you unfollow them now, you won't be able to follow them again.
						</AppTranslate>
					</p>

					<AppButton solid @click="onClickUnfollow()">
						<AppTranslate>Unfollow</AppTranslate>
					</AppButton>
				</AppExpand>
			</div>
		</section>
		<AppShellPageBackdrop v-else>
			<section class="section">
				<AppPageContainer xl order="left,main,right">
					<template #left>
						<!-- Bio -->
						<template v-if="!isOverviewLoaded">
							<div>
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" style="width: 40%" />
							</div>
							<br />
						</template>
						<template v-else-if="user.hasBio">
							<!--
								Set a :key to let vue know that it should update
								this when the user changes.
							-->
							<AppFadeCollapse
								:key="user.bio_content"
								:collapse-height="200"
								:is-open="showFullDescription"
								:animate="false"
								@require-change="canToggleDescription = $event"
								@expand="showFullDescription = true"
							>
								<AppContentViewer :source="user.bio_content" />
							</AppFadeCollapse>

							<p>
								<a
									v-if="canToggleDescription"
									class="hidden-text-expander"
									@click="showFullDescription = !showFullDescription"
								/>
							</p>
						</template>
					</template>

					<template #left-bottom>
						<!-- Shouts -->
						<template v-if="shouldShowShouts">
							<div class="pull-right">
								<AppButton trans @click="showComments()">
									<AppTranslate>View All</AppTranslate>
								</AppButton>
							</div>

							<h4 class="section-header">
								<AppTranslate>Shouts</AppTranslate>
								<small v-if="commentsCount">
									({{ formatNumber(commentsCount) }})
								</small>
							</h4>

							<AppCommentAddButton
								v-if="shouldShowShoutAdd"
								:model="user"
								:placeholder="addCommentPlaceholder"
								display-mode="shouts"
							/>

							<AppCommentOverview
								:comments="overviewComments"
								:model="user"
								display-mode="shouts"
								@reload-comments="reloadPreviewComments"
							/>
						</template>
					</template>

					<template #right>
						<AppShareCard resource="user" :url="shareUrl" bleed-padding />

						<AppUserKnownFollowers
							v-if="shouldShowKnownFollowers"
							:users="knownFollowers"
							:count="knownFollowerCount"
						/>

						<template v-if="hasQuickButtonsSection">
							<!-- Add Friend -->
							<AppButton
								v-if="canAddAsFriend"
								block
								@click="routeStore.sendFriendRequest()"
							>
								<AppTranslate>Send Friend Request</AppTranslate>
							</AppButton>
							<AppButton
								v-else-if="canMessage"
								block
								icon="user-messages"
								@click="openMessaging"
							>
								<AppTranslate>Message</AppTranslate>
							</AppButton>

							<template v-if="Screen.isMobile">
								<AppButton
									v-if="gamesCount > 0"
									block
									:to="{
										name: 'library.collection.developer',
										params: { id: user.username },
									}"
								>
									{{ formatNumber(gamesCount) }} Games
								</AppButton>
							</template>

							<br />
						</template>

						<!-- Social links -->
						<template v-if="hasLinksSection">
							<template v-if="linkedAccounts.length">
								<div v-if="twitchAccount">
									<AppLinkExternal
										class="link-unstyled"
										:href="twitchAccount.platformLink"
									>
										<AppJolticon :icon="twitchAccount.icon" />
										{{ ' ' }}
										{{ twitchAccount.name }}
									</AppLinkExternal>
								</div>
								<div v-if="twitterAccount">
									<AppLinkExternal
										class="link-unstyled"
										:href="twitterAccount.platformLink"
									>
										<AppJolticon :icon="twitterAccount.icon" />
										{{ ' ' }}
										<span>@</span>
										{{ twitterAccount.name }}
									</AppLinkExternal>
								</div>
								<div v-if="tumblrAccount && tumblrAccount.tumblrSelectedBlog">
									<AppLinkExternal
										class="link-unstyled"
										:href="tumblrAccount.tumblrSelectedBlog.url"
									>
										<AppJolticon :icon="tumblrAccount.icon" />
										{{ ' ' }}
										{{ tumblrAccount.tumblrSelectedBlog.title }}
									</AppLinkExternal>
								</div>
							</template>
							<div v-if="user.web_site">
								<AppLinkExternal class="link-unstyled" :href="user.web_site">
									<AppJolticon icon="link" />
									{{ ' ' }}
									<AppTranslate>Website</AppTranslate>
								</AppLinkExternal>
							</div>

							<br />
							<br />
						</template>

						<!-- Communities -->
						<template v-if="hasCommunitiesSection">
							<div class="clearfix">
								<div v-if="canShowMoreCommunities" class="pull-right">
									<AppButton
										trans
										:disabled="isLoadingAllCommunities"
										@click="toggleShowAllCommunities"
									>
										<AppTranslate>View All</AppTranslate>
										{{ ' ' }}
										<small>({{ formatNumber(communitiesCount) }})</small>
									</AppButton>
								</div>

								<h4 class="section-header">
									<AppTranslate>Communities</AppTranslate>
								</h4>
							</div>

							<span class="-communities">
								<template v-if="!isOverviewLoaded || isLoadingAllCommunities">
									<div
										v-for="i in previewCommunityCount"
										:key="i"
										class="-community-item -community-thumb-placeholder"
									>
										<AppAspectRatio :ratio="1" />
									</div>
								</template>
								<template v-else>
									<router-link
										v-for="community of shownCommunities"
										:key="community.id"
										v-app-tooltip.bottom="community.name"
										class="-community-item link-unstyled"
										:to="community.routeLocation"
									>
										<div class="-community-item-align">
											<AppCommunityThumbnailImg
												class="-community-thumb"
												:community="community"
											/>
											<AppCommunityVerifiedTick
												class="-community-verified-tick"
												:community="community"
												no-tooltip
											/>
										</div>
									</router-link>
								</template>
							</span>

							<br />
						</template>

						<!-- Latest Games -->
						<template v-if="hasGamesSection">
							<div class="clearfix">
								<div class="pull-right">
									<AppButton
										trans
										:to="{
											name: 'library.collection.developer',
											params: { id: user.username },
										}"
									>
										<AppTranslate>View All</AppTranslate>
										{{ ' ' }}
										<small>({{ formatNumber(gamesCount) }})</small>
									</AppButton>
								</div>

								<h4 class="section-header">
									<AppTranslate>Latest Games</AppTranslate>
								</h4>
							</div>

							<AppGameListPlaceholder v-if="!isOverviewLoaded" :num="7" />
							<AppGameList
								v-else-if="games.length"
								:games="games"
								event-label="profile"
							/>
						</template>

						<!-- Trophies -->
						<template v-if="shouldShowTrophies">
							<h4 class="section-header">
								<AppTranslate>Trophies</AppTranslate>
							</h4>

							<div class="-trophies">
								<template v-if="previewTrophies.length">
									<AppTrophyThumbnail
										v-for="trophy of previewTrophies"
										:key="trophy.key"
										class="-trophy"
										:trophy="trophy.trophy"
										no-difficulty
										no-highlight
										@click="onClickTrophy(trophy)"
									/>
								</template>

								<router-link
									v-if="shouldShowMoreTrophies"
									v-app-tooltip="$gettext(`View All Trophies...`)"
									class="-trophies-more -trophy link-unstyled"
									:to="{ name: 'profile.trophies' }"
								>
									+{{ moreTrophyCount }}
								</router-link>
							</div>

							<br />
						</template>
					</template>

					<template #default>
						<!-- User blocked -->
						<template v-if="userBlockedYou">
							<div class="alert">
								<p>
									<AppJolticon icon="notice" notice />
									<b><AppTranslate>This user blocked you.</AppTranslate></b>
									<AppTranslate>
										You are unable to shout at them or comment on their posts
										and games.
									</AppTranslate>
								</p>
							</div>
						</template>

						<!-- Friend Requests -->
						<template v-if="userFriendship">
							<AppExpand
								:when="userFriendship.state === UserFriendship.STATE_REQUEST_SENT"
								:animate-initial="true"
							>
								<div class="alert">
									<p>
										<AppTranslate
											:translate-params="{
												username: '@' + userFriendship.target_user.username,
											}"
										>
											Friend request to %{ username } pending acceptance.
										</AppTranslate>
									</p>
									<AppButton @click="routeStore.cancelFriendRequest()">
										<AppTranslate>Cancel Request</AppTranslate>
									</AppButton>
								</div>
							</AppExpand>

							<AppExpand
								:when="
									userFriendship.state === UserFriendship.STATE_REQUEST_RECEIVED
								"
								:animate-initial="true"
							>
								<div class="alert">
									<p>
										<AppTranslate
											:translate-params="{
												username: '@' + userFriendship.user.username,
											}"
										>
											%{ username } would like to be your friend.
										</AppTranslate>
									</p>
									<AppButton primary solid @click="onFriendRequestAccept">
										<AppTranslate>Add Friend</AppTranslate>
									</AppButton>
									<AppButton
										v-app-tooltip="$gettext('The sender will not be notified.')"
										trans
										@click="onFriendRequestReject"
									>
										<AppTranslate>Dismiss</AppTranslate>
									</AppButton>
								</div>
							</AppExpand>
						</template>

						<!-- Fireside -->
						<AppScrollInview
							v-if="shouldShowFireside"
							:config="FiresideScrollInviewConfig"
							@inview="onFiresideInview"
							@outview="onFiresideOutview"
						>
							<AppFiresideBadge
								:key="fireside"
								:fireside="fireside"
								:show-preview="canShowFiresidePreview"
								@changed="onFiresideBadgeChanged"
							/>
						</AppScrollInview>

						<router-view />
					</template>
				</AppPageContainer>
			</section>
		</AppShellPageBackdrop>
	</div>
</template>

<style lang="stylus" scoped>
.-banned-header
	margin-top: 0

.-communities
	display: grid
	grid-template-columns: repeat(5, minmax(55px, 1fr))
	grid-gap: 8px

.-community-item
	pressy()
	display: inline-block
	position: relative
	outline: 0
	width: 100%

.-community-thumb-placeholder
	img-circle()
	change-bg('bg-subtle')

.-community-verified-tick
	position: absolute
	right: -3px
	bottom: -1px
	change-bg('bg-offset')
	border-radius: 50%

.-trophies
	display: grid
	grid-template-columns: repeat(5, 55px)
	grid-gap: 5px 10px

	&-more
		change-bg('bg-offset')
		rounded-corners-lg()
		display: flex !important
		justify-content: center
		align-items: center
		font-size: $font-size-h4
		user-select: none

		&:hover
			text-decoration: none

.-trophy
	width: 55px
	height: 55px
	pressy()
	display: inline-block
	position: relative
	cursor: pointer
</style>
