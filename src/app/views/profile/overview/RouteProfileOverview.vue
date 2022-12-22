<script lang="ts">
import { computed, inject, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { numberSort } from '../../../../utils/array';
import { removeQuery } from '../../../../utils/router';
import AppAnimChargeOrb from '../../../../_common/animation/AppAnimChargeOrb.vue';
import { Api } from '../../../../_common/api/api.service';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppCommentAddButton from '../../../../_common/comment/add-button/add-button.vue';
import { Comment } from '../../../../_common/comment/comment-model';
import {
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
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { formatFuzzynumber } from '../../../../_common/filters/fuzzynumber';
import { formatNumber } from '../../../../_common/filters/number';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { Game } from '../../../../_common/game/game.model';
import AppInviteCard from '../../../../_common/invite/AppInviteCard.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import '../../../../_common/lazy/placeholder/placeholder.styl';
import AppLinkExternal from '../../../../_common/link/AppLinkExternal.vue';
import { LinkedAccount, Provider } from '../../../../_common/linked-account/linked-account.model';
import { Meta } from '../../../../_common/meta/meta-service';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import { showUserFiresideFollowModal } from '../../../../_common/user/fireside/modal/follow-modal.service';
import { UserFriendship } from '../../../../_common/user/friendship/friendship.model';
import { showUserInviteFollowModal } from '../../../../_common/user/invite/modal/modal.service';
import { UserBaseTrophy } from '../../../../_common/user/trophy/user-base-trophy.model';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/AppUserAvatarImg.vue';
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

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: {},
		resolver: ({ route }) => Api.sendRequest('/web/profile/overview/@' + route.params.username),
	}),
};
</script>

<script lang="ts" setup>
const FiresideScrollInviewConfig = new ScrollInviewConfig({
	emitsOn: 'partial-overlap',
	trackFocused: false,
});

interface TopSupporter {
	user: User;
	value: number;
}

const {
	isOverviewLoaded,
	gamesCount,
	communitiesCount,
	placeholderCommunitiesCount,
	userFriendship,
	previewTrophies,
	trophyCount,
	user: routeUser,
	overviewPayload,
	acceptFriendRequest,
	rejectFriendRequest,
	removeFriend,
	sendFriendRequest,
	cancelFriendRequest,
} = useProfileRouteController()!;

const { toggleLeftPane } = useAppStore();
const { user: myUser } = useCommonStore();
const { grid, chat } = useGridStore();

const route = useRoute();
const router = useRouter();

const commentManager = inject(CommentStoreManagerKey)!;

const commentStore = ref<CommentStoreModel | null>(null);

const showFullDescription = ref(false);
const canToggleDescription = ref(false);
const showAllCommunities = ref(false);
const isLoadingAllCommunities = ref(false);
const games = ref<Game[]>([]);
const communities = ref<Community[]>([]);
const allCommunities = ref<Community[] | null>(null);
const topSupporters = ref<TopSupporter[]>([]);
const overviewComments = ref<Comment[]>([]);
const linkedAccounts = ref<LinkedAccount[]>([]);
const knownFollowers = ref<User[]>([]);
const knownFollowerCount = ref(0);
const fireside = ref<Fireside | null>(null);
const hadInitialFireside = ref(false);
const isFiresideInview = ref(false);
const firesideHasVideo = ref(false);
const maintainFiresideOutviewSpace = ref(false);

let permalinkWatchDeregister: CommentThreadModalPermalinkDeregister | undefined = undefined;

const routeTitle = computed(() => {
	if (routeUser.value) {
		return `${routeUser.value.display_name} (@${routeUser.value.username})`;
	}
	return null;
});

const shareUrl = computed(() => {
	if (!routeUser.value) {
		return Environment.baseUrl;
	}

	return Environment.baseUrl + routeUser.value.url;
});

const canAddAsFriend = computed(() => {
	return (
		myUser.value &&
		routeUser.value &&
		routeUser.value.id !== myUser.value.id &&
		!userFriendship.value &&
		routeUser.value.friend_requests_enabled &&
		!routeUser.value.is_blocked &&
		!routeUser.value.blocked_you
	);
});

const hasQuickButtonsSection = computed(() => {
	return canAddAsFriend.value || canMessage.value || (Screen.isMobile && gamesCount.value > 0);
});

const hasLinksSection = computed(() => {
	return (
		routeUser.value &&
		((linkedAccounts.value && linkedAccounts.value.length > 0) || routeUser.value.web_site)
	);
});

const hasGamesSection = computed(() => {
	return !Screen.isMobile && gamesCount.value > 0;
});

const hasCommunitiesSection = computed(() => {
	return !Screen.isMobile && communitiesCount.value > 0;
});

const twitterAccount = computed(() => {
	return getLinkedAccount(LinkedAccount.PROVIDER_TWITTER);
});

const twitchAccount = computed(() => {
	return getLinkedAccount(LinkedAccount.PROVIDER_TWITCH);
});

const tumblrAccount = computed(() => {
	const account = getLinkedAccount(LinkedAccount.PROVIDER_TUMBLR);
	if (account && account.tumblrSelectedBlog) {
		return account;
	}
	return null;
});

const addCommentPlaceholder = computed(() => {
	if (!routeUser.value) {
		return undefined;
	}

	if (myUser.value && routeUser.value.id === myUser.value.id) {
		return $gettext('Shout at yourself!');
	} else {
		return $gettext('Shout') + ' @' + routeUser.value.username + '!';
	}
});

const commentsCount = computed(() => {
	if (routeUser.value && routeUser.value.comment_count) {
		return routeUser.value.comment_count;
	}
	return 0;
});

const shouldShowShouts = computed(() => {
	return routeUser.value && !Screen.isMobile && routeUser.value.shouts_enabled;
});

const isFriend = computed(() => {
	return userFriendship.value && userFriendship.value.state === UserFriendship.STATE_FRIENDS;
});

const canMessage = computed(() => {
	return isFriend.value && chat.value && chat.value.connected;
});

const previewCommunityCount = computed(() => {
	return isLoadingAllCommunities.value
		? communitiesCount.value
		: placeholderCommunitiesCount.value;
});

const canShowMoreCommunities = computed(() => {
	return communitiesCount.value > communities.value.length;
});

const shownCommunities = computed(() => {
	return showAllCommunities.value && allCommunities.value
		? allCommunities.value
		: communities.value;
});

const shouldShowKnownFollowers = computed(() => {
	return (
		!!myUser.value &&
		!!routeUser.value &&
		isOverviewLoaded.value &&
		myUser.value.id !== routeUser.value.id
	);
});

const shouldShowTrophies = computed(() => {
	return !Screen.isMobile && !!previewTrophies.value && previewTrophies.value.length > 0;
});

const shouldShowMoreTrophies = computed(() => {
	return shouldShowTrophies.value && trophyCount.value > previewTrophies.value!.length;
});

const moreTrophyCount = computed(() => {
	return trophyCount.value - (previewTrophies.value || []).length;
});

const shouldShowShoutAdd = computed(() => {
	return routeUser.value && routeUser.value.canMakeComment;
});

const userBlockedYou = computed(() => {
	return routeUser.value && routeUser.value.blocked_you;
});

const shouldShowFireside = computed(() => {
	// Keep the FiresideBadge around so we don't mess with their scroll
	// position when a fireside expires.
	return (!!fireside.value && fireside.value.canJoin()) || hadInitialFireside.value;
});

const canShowFiresidePreview = computed(() => {
	return (
		shouldShowFireside.value &&
		(isFiresideInview.value ? firesideHasVideo.value : maintainFiresideOutviewSpace.value)
	);
});

function getLinkedAccount(provider: Provider) {
	if (
		routeUser.value &&
		linkedAccounts.value &&
		linkedAccounts.value.some(i => i.provider === provider)
	) {
		const account = linkedAccounts.value.find(i => i.provider === provider);
		if (account) {
			return account;
		}
	}
	return null;
}

createAppRoute({
	routeTitle,
	onInit() {
		showFullDescription.value = false;
		showAllCommunities.value = false;
		isLoadingAllCommunities.value = false;
		games.value = [];
		communities.value = [];
		allCommunities.value = null;
		linkedAccounts.value = [];
		overviewComments.value = [];
	},
	onResolved({ payload }) {
		Meta.description = payload.metaDescription;
		Meta.fb = payload.fb || {};
		Meta.fb.title = routeTitle.value;
		Meta.twitter = payload.twitter || {};
		Meta.twitter.title = routeTitle.value;

		// Release the CommentStore if there was one left over.
		clearCommentStore();

		showFullDescription.value = false;
		showAllCommunities.value = false;
		isLoadingAllCommunities.value = false;
		games.value = Game.populate(payload.developerGamesTeaser);
		communities.value = Community.populate(payload.communities);
		linkedAccounts.value = LinkedAccount.populate(payload.linkedAccounts);
		overviewComments.value = Comment.populate(payload.comments);

		if (payload.topSupporters) {
			const newList = Array.from<TopSupporter>(payload.topSupporters).reduce(
				(result, current) => {
					if (current.user && current.value) {
						result.push({
							user: new User(current.user),
							value: current.value,
						});
					}
					return result;
				},
				[] as TopSupporter[]
			);
			topSupporters.value = newList;
		} else {
			topSupporters.value = [];
		}

		if (routeUser.value) {
			CommentThreadModal.showFromPermalink(router, routeUser.value, 'shouts');
			permalinkWatchDeregister = CommentThreadModal.watchForPermalink(
				router,
				routeUser.value,
				'shouts'
			);

			// Initialize a CommentStore lock for profile shouts.
			commentStore.value = lockCommentStore(commentManager, 'User', routeUser.value.id);
			setCommentCount(commentStore.value, routeUser.value.comment_count);

			// They came from an invite link.
			if (route.query['invite'] !== undefined) {
				// Only show the modal if they're not following yet.
				if (!routeUser.value.is_following) {
					showUserInviteFollowModal(routeUser.value);
				}

				removeQuery(router, 'invite');
			}

			// They came from a /fireside/@user link, but they're not streaming.
			if (route.query['fireside'] !== undefined) {
				showUserFiresideFollowModal(routeUser.value);
				removeQuery(router, 'fireside');
			}
		}

		if (payload.knownFollowers) {
			knownFollowers.value = User.populate(payload.knownFollowers);
		}
		if (payload.knownFollowerCount) {
			knownFollowerCount.value = payload.knownFollowerCount;
		}

		fireside.value = payload.fireside ? new Fireside(payload.fireside) : null;
		hadInitialFireside.value = !!fireside.value;

		overviewPayload(payload);
	},
	onDestroyed() {
		clearCommentStore();
		if (permalinkWatchDeregister) {
			permalinkWatchDeregister();
			permalinkWatchDeregister = undefined;
		}
	},
});

function clearCommentStore() {
	if (commentStore.value) {
		releaseCommentStore(commentManager, commentStore.value);
		commentStore.value = null;
	}
}

function showComments() {
	if (routeUser.value) {
		CommentModal.show({
			model: routeUser.value,
			displayMode: 'shouts',
		});
	}
}

function openMessaging() {
	if (routeUser.value && chat.value) {
		const chatUser = chat.value.friendsList.collection.find(u => u.id === routeUser.value!.id);
		if (chatUser) {
			if (Screen.isXs) {
				toggleLeftPane('chat');
			}
			enterChatRoom(chat.value, chatUser.room_id);
		}
	}
}

function onFiresideInview() {
	isFiresideInview.value = true;
	maintainFiresideOutviewSpace.value = false;
}

function onFiresideOutview() {
	maintainFiresideOutviewSpace.value = canShowFiresidePreview.value;
	isFiresideInview.value = false;
}

function onFiresideBadgeChanged(hasVideo: boolean, _isStreaming: boolean) {
	firesideHasVideo.value = hasVideo;
}

async function toggleShowAllCommunities() {
	if (!routeUser.value) {
		return;
	}

	if (isLoadingAllCommunities.value) {
		return;
	}

	showAllCommunities.value = !showAllCommunities.value;
	if (showAllCommunities.value && allCommunities.value === null) {
		isLoadingAllCommunities.value = true;

		try {
			const payload = await Api.sendRequest(
				`/web/profile/communities/@${routeUser.value.username}`,
				null,
				{ detach: true }
			);
			allCommunities.value = Community.populate(payload.communities);
		} catch (e) {
			console.error(`Failed to load all communities for user ${routeUser.value.id}`);
			console.error(e);
			showAllCommunities.value = false;
		} finally {
			isLoadingAllCommunities.value = false;
		}
	}
}

async function reloadPreviewComments() {
	if (routeUser.value) {
		const $payload = await Api.sendRequest(
			'/web/profile/comment-overview/@' + routeUser.value.username
		);
		overviewComments.value = Comment.populate($payload.comments);
		routeUser.value.comment_count = $payload.count;
	}
}

function onClickTrophy(userTrophy: UserBaseTrophy) {
	TrophyModal.show(userTrophy);
}

async function onClickUnfollow() {
	if (routeUser.value) {
		const result = await ModalConfirm.show(
			$gettext(`Are you sure you want to unfollow this user?`),
			$gettext(`Unfollow user?`)
		);

		if (!result) {
			return;
		}

		unfollowUser(routeUser.value);
	}
}

async function onFriendRequestAccept() {
	await acceptFriendRequest();

	grid.value?.pushViewNotifications('friend-requests');
}

async function onFriendRequestReject() {
	const rejected = await rejectFriendRequest();

	if (rejected) {
		grid.value?.pushViewNotifications('friend-requests');
	}
}
</script>

<template>
	<div v-if="routeUser">
		<!--
			If this user is banned, we show very little.
		-->
		<section v-if="!routeUser.status" class="section fill-notice">
			<div class="container">
				<h2 class="-banned-header">
					{{ $gettext(`This account is banned.`) }}
				</h2>

				<AppExpand :when="isFriend">
					<p>
						<strong>
							{{ $gettext(`This user was your friend.`) }}
						</strong>
						<br />
						{{
							$gettext(
								`If you remove them from your friends list, you will no longer be able to access your chat history with them.`
							)
						}}
					</p>

					<AppButton solid @click="removeFriend()">
						{{ $gettext(`Remove friend`) }}
					</AppButton>
				</AppExpand>

				<AppExpand :when="routeUser.is_following">
					<!-- Create some padding -->
					<template v-if="isFriend">
						<br />
						<br />
					</template>

					<p>
						<strong>
							{{ $gettext(`You were following this user.`) }}
						</strong>
						<br />
						{{
							$gettext(
								`If you unfollow them now, you won't be able to follow them again.`
							)
						}}
					</p>

					<AppButton solid @click="onClickUnfollow()">
						{{ $gettext(`Unfollow`) }}
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
						<template v-else-if="routeUser.hasBio">
							<!--
								Set a :key to let vue know that it should update
								this when the user changes.
							-->
							<AppFadeCollapse
								:key="routeUser.bio_content"
								:collapse-height="200"
								:is-open="showFullDescription"
								:animate="false"
								@require-change="canToggleDescription = $event"
								@expand="showFullDescription = true"
							>
								<AppContentViewer :source="routeUser.bio_content" />
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
									{{ $gettext(`View all`) }}
								</AppButton>
							</div>

							<h4 class="section-header">
								{{ $gettext(`Shouts`) }}
								<small v-if="commentsCount">
									({{ formatNumber(commentsCount) }})
								</small>
							</h4>

							<AppCommentAddButton
								v-if="shouldShowShoutAdd"
								:model="routeUser"
								:placeholder="addCommentPlaceholder"
								display-mode="shouts"
							/>

							<AppCommentOverview
								:comments="overviewComments"
								:model="routeUser"
								display-mode="shouts"
								@reload-comments="reloadPreviewComments"
							/>
						</template>
					</template>

					<template #right>
						<AppShareCard
							v-if="!myUser || myUser.id !== routeUser.id"
							resource="user"
							:url="shareUrl"
							bleed-padding
						/>
						<AppInviteCard v-else :user="myUser" />

						<AppUserKnownFollowers
							v-if="shouldShowKnownFollowers"
							:users="knownFollowers"
							:count="knownFollowerCount"
						/>

						<template v-if="hasQuickButtonsSection">
							<!-- Add Friend -->
							<AppButton v-if="canAddAsFriend" block @click="sendFriendRequest()">
								{{ $gettext(`Send friend request`) }}
							</AppButton>
							<AppButton
								v-else-if="canMessage"
								block
								icon="user-messages"
								@click="openMessaging"
							>
								{{ $gettext(`Message`) }}
							</AppButton>

							<template v-if="Screen.isMobile">
								<AppButton
									v-if="gamesCount > 0"
									block
									:to="{
										name: 'library.collection.developer',
										params: { id: routeUser.username },
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
							<div v-if="routeUser.web_site">
								<AppLinkExternal class="link-unstyled" :href="routeUser.web_site">
									<AppJolticon icon="link" />
									{{ ' ' }}
									{{ $gettext(`Website`) }}
								</AppLinkExternal>
							</div>

							<br />
							<br />
						</template>

						<!-- Top supporters -->
						<template v-if="topSupporters.length">
							<div class="clearfix">
								<h4 class="section-header">
									{{ $gettext(`Top supporters`) }}
								</h4>
							</div>

							<div class="-supporters-card">
								<div
									v-for="(supporter, index) of topSupporters
										.sort((a, b) => numberSort(b.value, a.value))
										.splice(0, 3)"
									:key="supporter.user.id"
									class="-supporter"
								>
									<AppUserAvatarImg
										class="-supporter-avatar"
										:class="{ '-large': index === 0 }"
									/>

									<AppSpacer vertical :scale="2" />

									<div class="-supporter-username">
										{{ '@' + supporter.user.username }}
									</div>

									<AppSpacer vertical :scale="2" />

									<div class="-supporter-data">
										<AppAnimChargeOrb
											class="-supporter-orb"
											use-random-offset
										/>

										<span class="-supporter-value">
											{{ formatFuzzynumber(supporter.value) }}
										</span>
									</div>
								</div>
							</div>

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
										{{ $gettext(`View all`) }}
										{{ ' ' }}
										<small>({{ formatNumber(communitiesCount) }})</small>
									</AppButton>
								</div>

								<h4 class="section-header">
									{{ $gettext(`Communities`) }}
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
									<RouterLink
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
									</RouterLink>
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
											params: { id: routeUser.username },
										}"
									>
										{{ $gettext(`View all`) }}
										{{ ' ' }}
										<small>({{ formatNumber(gamesCount) }})</small>
									</AppButton>
								</div>

								<h4 class="section-header">
									{{ $gettext(`Latest games`) }}
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
								{{ $gettext(`Trophies`) }}
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

								<RouterLink
									v-if="shouldShowMoreTrophies"
									v-app-tooltip="$gettext(`View All Trophies...`)"
									class="-trophies-more -trophy link-unstyled"
									:to="{ name: 'profile.trophies' }"
								>
									+{{ moreTrophyCount }}
								</RouterLink>
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
									<b>
										{{ $gettext(`This user blocked you.`) }}
									</b>
									{{
										$gettext(
											`You are unable to shout at them or comment on their posts and games.`
										)
									}}
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
										{{
											$gettextInterpolate(
												`Friend request to %{ username } pending acceptance.`,
												{
													username:
														'@' + userFriendship.target_user.username,
												}
											)
										}}
									</p>
									<AppButton @click="cancelFriendRequest()">
										{{ $gettext(`Cancel request`) }}
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
										{{
											$gettextInterpolate(
												`%{ username } would like to be your friend.`,
												{
													username: '@' + userFriendship.user.username,
												}
											)
										}}
									</p>
									<AppButton primary solid @click="onFriendRequestAccept">
										{{ $gettext(`Add friend`) }}
									</AppButton>
									<AppButton
										v-app-tooltip="$gettext('The sender will not be notified.')"
										trans
										@click="onFriendRequestReject"
									>
										{{ $gettext(`Dismiss`) }}
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
								:key="fireside?.hash || `no-fireside-${routeUser.id}`"
								:fireside="fireside"
								:show-preview="canShowFiresidePreview"
								@changed="onFiresideBadgeChanged"
							/>
						</AppScrollInview>

						<RouterView />
					</template>
				</AppPageContainer>
			</section>
		</AppShellPageBackdrop>
	</div>
</template>

<style lang="stylus" scoped>
.-banned-header
	margin-top: 0

.-supporters-card
	rounded-corners-lg()
	padding: 12px 16px
	display: flex
	gap: 16px

.-supporter
	flex: 1

.-supporter-avatar
	width: 40px
	height: 40px

	&.-large
		width: 56px
		height: 56px

.-supporter-username
	text-overflow()
	max-width: 100%
	min-width: 0

.-supporter-data
	display: flex
	align-items: center
	gap: 8px

.-supporter-orb
	width: 16px
	height: 16px
	margin-right: 8px

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
