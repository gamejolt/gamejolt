<script lang="ts">
import { Ref, computed, ref, toRef } from 'vue';
import { RouteLocationRaw, RouterView, useRoute, useRouter } from 'vue-router';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import { isAdEnthused } from '../../../../_common/ad/ad-store';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import {
	CommentStoreModel,
	commentStoreCount,
	lockCommentStore,
	releaseCommentStore,
	useCommentStoreManager,
} from '../../../../_common/comment/comment-store';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { GameModel } from '../../../../_common/game/game.model';
import AppInviteCard from '../../../../_common/invite/AppInviteCard.vue';
import AppJolticon, { Jolticon } from '../../../../_common/jolticon/AppJolticon.vue';
import AppLinkExternal from '../../../../_common/link/AppLinkExternal.vue';
import {
	LinkedAccountModel,
	LinkedAccountProvider,
} from '../../../../_common/linked-account/linked-account.model';
import { Meta } from '../../../../_common/meta/meta-service';
import { showModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTopSupportersCard, {
	OwnSupport,
	TopSupporter,
} from '../../../../_common/supporters/AppTopSupportersCard.vue';
import { kThemeFg10 } from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserFollowButton from '../../../../_common/user/follow/AppUserFollowButton.vue';
import { UserFriendshipState } from '../../../../_common/user/friendship/friendship.model';
import { showUserInviteFollowModal } from '../../../../_common/user/invite/modal/modal.service';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { $unfollowUser, UserModel } from '../../../../_common/user/user.model';
import {
	styleChangeBg,
	styleElevate,
	styleFlexCenter,
	styleWhen,
} from '../../../../_styles/mixins';
import { kBorderRadiusLg } from '../../../../_styles/variables';
import { numberSort } from '../../../../utils/array';
import { removeQuery } from '../../../../utils/router';
import { openChatRoom } from '../../../components/chat/client';
import { showCommentModal } from '../../../components/comment/modal/modal.service';
import {
	CommentThreadModalPermalinkDeregister,
	showCommentThreadModalFromPermalink,
	watchForCommentThreadModalPermalink,
} from '../../../components/comment/thread/modal.service';
import AppGameList from '../../../components/game/list/AppGameList.vue';
import AppGameListPlaceholder from '../../../components/game/list/AppGameListPlaceholder.vue';
import { useGridStore } from '../../../components/grid/grid-store';
import AppPageContainer from '../../../components/page-container/AppPageContainer.vue';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import AppUserKnownFollowers from '../../../components/user/known-followers/AppUserKnownFollowers.vue';
import { useAppStore } from '../../../store/index';
import { useProfileRouteStore } from '../RouteProfile.vue';
import AppProfileDogtags from '../dogtags/AppProfileDogtags.vue';
import AppProfileFloatingHeader from './AppProfileFloatingHeader.vue';
import AppRouteProfileOverviewBanned from './AppRouteProfileOverviewBanned.vue';
import AppProfileShopButton from './shop/AppProfileShopButton.vue';
import AppProfileShortcut from './shortcut/AppProfileShortcut.vue';
import AppProfileShortcutExtras from './shortcut/AppProfileShortcutExtras.vue';
import AppProfileShortcuts, { ProfileQuickLink } from './shortcut/AppProfileShortcuts.vue';
import AppProfileStat from './stats/AppProfileStat.vue';
import AppProfileStats, { ProfileStat } from './stats/AppProfileStats.vue';

export type ProfileTileAction =
	| { location: RouteLocationRaw; action?: never }
	| { location?: never; action: () => void }
	| { location?: never; action?: never };

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
const {
	isOverviewLoaded,
	gamesCount,
	communitiesCount,
	// placeholderCommunitiesCount,
	userFriendship,
	previewTrophies,
	// trophyCount,
	user: routeUser,
	overviewPayload,
	acceptFriendRequest,
	rejectFriendRequest,
	removeFriend,
	sendFriendRequest,
	cancelFriendRequest,
	stickySides,
	pageOffsetTop,
	hasSales,
	pageScrollPositionThroughHeader,
	isMe,
} = useProfileRouteStore()!;

const { toggleLeftPane } = useAppStore();
const { user: myUser } = useCommonStore();
const { grid, chat } = useGridStore();

const route = useRoute();
const router = useRouter();

const commentManager = useCommentStoreManager()!;

const commentStore = ref<CommentStoreModel | null>(null);

const showFullDescription = ref(false);
const canToggleDescription = ref(false);
// const showAllCommunities = ref(false);
// const isLoadingAllCommunities = ref(false);
const games = ref<GameModel[]>([]);
const communities = ref<CommunityModel[]>([]);
// const allCommunities = ref<CommunityModel[] | null>(null);
const supportersData = ref() as Ref<
	{ supporters: TopSupporter[]; ownSupport: OwnSupport } | undefined
>;
// const overviewComments = ref<CommentModel[]>([]);
const linkedAccounts = ref<LinkedAccountModel[]>([]);
const knownFollowers = ref<UserModel[]>([]);
const knownFollowerCount = ref(0);

let permalinkWatchDeregister: CommentThreadModalPermalinkDeregister | undefined = undefined;

const routeTitle = toRef(() => {
	if (routeUser.value) {
		return `${routeUser.value.display_name} (@${routeUser.value.username})`;
	}
	return null;
});

const shareUrl = toRef(() => {
	if (!routeUser.value) {
		return Environment.baseUrl;
	}

	return Environment.baseUrl + routeUser.value.url;
});

const canAddAsFriend = toRef(
	() =>
		myUser.value &&
		routeUser.value &&
		routeUser.value.id !== myUser.value.id &&
		!userFriendship.value &&
		routeUser.value.friend_requests_enabled &&
		!routeUser.value.is_blocked &&
		!routeUser.value.blocked_you
);

const hasQuickButtonsSection = toRef(
	() => canAddAsFriend.value || canMessage.value || (Screen.isMobile && gamesCount.value > 0)
);
const hasLinksSection = toRef(
	() =>
		routeUser.value &&
		((linkedAccounts.value && linkedAccounts.value.length > 0) || routeUser.value.web_site)
);
const hasGamesSection = toRef(() => !Screen.isMobile && gamesCount.value > 0);
const hasCommunitiesSection = toRef(() => !Screen.isMobile && communitiesCount.value > 0);
const twitchAccount = computed(() => getLinkedAccount(LinkedAccountProvider.Twitch));
const shouldShowShouts = toRef(
	() => routeUser.value && !Screen.isMobile && routeUser.value.shouts_enabled
);
const isFriend = toRef(
	() => userFriendship.value && userFriendship.value.state === UserFriendshipState.Friends
);
const canMessage = toRef(() => isFriend.value && chat.value && chat.value.connected);
const shouldShowKnownFollowers = toRef(
	() =>
		!!myUser.value &&
		!!routeUser.value &&
		isOverviewLoaded.value &&
		myUser.value.id !== routeUser.value.id
);
const shouldShowTrophies = toRef(
	() => !Screen.isMobile && !!previewTrophies.value && previewTrophies.value.length > 0
);
const userBlockedYou = toRef(() => routeUser.value && routeUser.value.blocked_you);

function getLinkedAccount(provider: LinkedAccountProvider) {
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
		// showAllCommunities.value = false;
		// isLoadingAllCommunities.value = false;
		games.value = [];
		communities.value = [];
		// allCommunities.value = null;
		linkedAccounts.value = [];
		// overviewComments.value = [];
		supportersData.value = undefined;
		hasSales.value = false;
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
		// showAllCommunities.value = false;
		// isLoadingAllCommunities.value = false;
		games.value = GameModel.populate(payload.developerGamesTeaser);
		communities.value = CommunityModel.populate(payload.communities);
		linkedAccounts.value = LinkedAccountModel.populate(payload.linkedAccounts);
		// overviewComments.value = storeModelList(CommentModel, payload.comments);
		hasSales.value = payload.hasSales === true;

		let supporters: TopSupporter[] = [];
		if (payload.topSupporters && Array.isArray(payload.topSupporters)) {
			const supportersData: Partial<TopSupporter>[] = payload.topSupporters;
			const newSupporters: TopSupporter[] = [];

			for (const { user, value } of supportersData) {
				if (user && value) {
					newSupporters.push({
						user: new UserModel(user),
						value,
					});
				}
			}

			supporters = newSupporters.sort((a, b) => numberSort(b.value, a.value)).slice(0, 3);
		}
		supportersData.value = {
			supporters,
			ownSupport: {
				lastPeriod: payload.ownSupport?.lastPeriod || 0,
				total: payload.ownSupport?.total || 0,
			},
		};

		if (routeUser.value) {
			showCommentThreadModalFromPermalink(router, routeUser.value, 'shouts');
			permalinkWatchDeregister = watchForCommentThreadModalPermalink(
				router,
				routeUser.value,
				'shouts'
			);

			// Initialize a CommentStore lock for profile shouts.
			commentStore.value = lockCommentStore(commentManager, 'User', routeUser.value.id);
			commentStoreCount(commentStore.value, routeUser.value.comment_count);

			// They came from an invite link.
			if (route.query['invite'] !== undefined) {
				// Only show the modal if they're not following yet.
				if (!routeUser.value.is_following) {
					showUserInviteFollowModal(routeUser.value);
				}

				removeQuery(router, 'invite');
			}
		}

		if (payload.knownFollowers) {
			knownFollowers.value = UserModel.populate(payload.knownFollowers);
		}
		if (payload.knownFollowerCount) {
			knownFollowerCount.value = payload.knownFollowerCount;
		}

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

function openMessaging() {
	if (routeUser.value && chat.value) {
		const chatUser = chat.value.friendsList.get(routeUser.value.id);
		if (chatUser) {
			if (Screen.isXs) {
				toggleLeftPane('chat');
			}
			openChatRoom(chat.value, chatUser.room_id);
		}
	}
}

async function onClickUnfollow() {
	if (routeUser.value) {
		const result = await showModalConfirm(
			$gettext(`Are you sure you want to unfollow this user?`),
			$gettext(`Unfollow user?`)
		);

		if (!result) {
			return;
		}

		$unfollowUser(routeUser.value);
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

const stats = computed<ProfileStat[]>(
	() =>
		[
			{
				label: $gettext('Following'),
				value: formatNumber(routeUser.value?.following_count || 0),
				location: {
					name: 'profile.following',
				},
			},
			{
				label: $gettext('Followers'),
				value: formatNumber(routeUser.value?.follower_count || 0),
				location: {
					name: 'profile.followers',
				},
			},
			{
				label: $gettext('Likes'),
				value: formatNumber(routeUser.value?.like_count || 0),
			},
		] satisfies ProfileStat[]
);

const quickLinks = computed<ProfileQuickLink[]>(() => {
	const items: ProfileQuickLink[] = [];

	if (!routeUser.value || Screen.isMobile) {
		return items;
	}

	if (hasSales.value) {
		items.push({
			label: $gettext(`Shop`),
			icon: 'marketplace-filled',
			location: {
				name: 'profile.shop',
				params: {
					username: routeUser.value.username,
				},
			},
		});
	}

	if (shouldShowShouts.value) {
		items.push({
			label: $gettext(`Shouts`),
			icon: 'comment-filled',
			action() {
				showCommentModal({
					model: routeUser.value!,
					displayMode: 'shouts',
				});
			},
		});
	}

	if (hasGamesSection.value) {
		items.push({
			label: $gettext(`Games`),
			icon: 'gamepad',
			// TODO(profile-scrunch) modal
			location: {
				name: 'library.collection.developer',
				params: { id: routeUser.value.username },
			},
		});
	}

	if (shouldShowTrophies.value) {
		items.push({
			label: $gettext(`Trophies`),
			icon: 'trophy',
			// TODO(profile-scrunch) modal
			location: { name: 'profile.trophies' },
		});
	}

	if (hasCommunitiesSection.value) {
		items.push({
			label: $gettext(`Communities`),
			icon: 'communities',
			// TODO(profile-scrunch) modal
			location: {
				name: 'library.collection.developer',
				params: { id: routeUser.value.username },
			},
		});
	}

	return items;
});

interface ProfileSocialLink {
	label: string;
	icon: Jolticon;
	url: string;
}

const socialLinks = computed(() => {
	const items: ProfileSocialLink[] = [];

	if (!routeUser.value || !hasLinksSection.value) {
		return items;
	}

	if (twitchAccount.value) {
		items.push({
			label: twitchAccount.value.name,
			icon: twitchAccount.value.icon,
			url: twitchAccount.value.platformLink,
		});
	}

	if (routeUser.value.web_site) {
		items.push({
			label: $gettext(`Website`),
			icon: 'link',
			url: routeUser.value.web_site,
		});
	}

	return items;
});

const shouldShowFollow = toRef(
	() =>
		routeUser.value &&
		!routeUser.value.is_blocked &&
		!routeUser.value.blocked_you &&
		!isMe.value
);

const showSidebarAvatar = toRef(() => stickySides.value || Screen.isMobile);
const fadeUpHeader = computed(
	() =>
		// TODO(profile-scrunch): Figure out if we want this
		false ??
		((Screen.isDesktop && !stickySides.value) || pageScrollPositionThroughHeader.value >= 1)
);
</script>

<template>
	<div v-if="routeUser">
		<!-- If they're banned, show very little -->
		<AppRouteProfileOverviewBanned
			v-if="!routeUser.status"
			:user="routeUser"
			:is-friend="isFriend"
			@removefriend="removeFriend()"
			@unfollow="onClickUnfollow()"
		/>
		<AppShellPageBackdrop v-else>
			<section
				class="section"
				:style="{
					...styleWhen(Screen.isMobile, {
						paddingTop: 0,
					}),
				}"
			>
				<AppPageContainer
					xl
					order="left,main,right"
					sticky-sides
					:disable-sticky-sides="!stickySides"
					:sticky-side-top-margin="40"
				>
					<template #left>
						<!-- Stats & Shortcuts -->
						<!-- TODO(profile-scrunch) clean this up -->
						<AppExpand :when="showSidebarAvatar">
							<AppSpacer vertical :scale="6" />
						</AppExpand>
						<div class="sheet">
							<!-- Avatar/Tags -->
							<AppExpand
								:when="showSidebarAvatar"
								animate-initial
								:style="{ overflow: `visible` }"
							>
								<div
									:style="{
										height: `${100 / 2 + 24}px`,
										width: `100%`,
										position: `relative`,
										...styleWhen(Screen.isMobile, {
											transition: `opacity 100ms linear, transform 100ms linear`,
											transform: `translateY(${fadeUpHeader ? -50 : 0}%)`,
											opacity: fadeUpHeader ? 0 : 1,
										}),
									}"
								>
									<Transition>
										<div
											v-if="showSidebarAvatar"
											class="anim-fade-in-down anim-fade-leave-up"
											:style="{
												...styleFlexCenter(),
												position: `absolute`,
												width: `100%`,
												bottom: `24px`,
											}"
										>
											<AppUserAvatarBubble
												:user="routeUser"
												show-frame
												show-verified
												verified-size="big"
												:verified-offset="0"
												disable-link
												:style="{
													width: `100px`,
												}"
											/>
											<div
												:style="{
													position: `absolute`,
													bottom: `-16px`,
													maxWidth: `100%`,
													zIndex: 2,
												}"
											>
												<AppProfileDogtags />
											</div>
										</div>
									</Transition>
								</div>
							</AppExpand>

							<!-- Stats -->
							<AppProfileStats :items="stats">
								<template #default="item">
									<AppProfileStat :item="item" />
								</template>
							</AppProfileStats>

							<div
								:style="{
									margin: `20px -20px`,
									height: `1px`,
									backgroundColor: kThemeFg10,
								}"
							/>

							<!-- Shortcuts -->
							<AppProfileShortcuts v-if="Screen.isDesktop" :items="quickLinks">
								<template #default="item">
									<AppProfileShortcut :item="item" />
								</template>

								<template #extras>
									<AppProfileShortcutExtras />
								</template>
							</AppProfileShortcuts>
							<template v-else>
								<!-- TODO(profile-scrunch) Probably want to show
								block buttons here on mobile (follow, edit,
								friend-request, etc.) -->
								<!--  -->
							</template>
						</div>

						<!-- Bio -->
						<!-- TODO(profile-scrunch) See how things look moving
						this into the shortcuts sheet. Add the same divider we
						have between stats and shortcuts. -->
						<div v-if="!isOverviewLoaded" class="sheet">
							<div>
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" style="width: 40%" />
							</div>
							<br />
						</div>
						<div v-else-if="routeUser.hasBio" class="sheet">
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

							<!-- <p> -->
							<a
								v-if="canToggleDescription"
								class="hidden-text-expander"
								@click="showFullDescription = !showFullDescription"
							/>
							<!-- </p> -->
						</div>

						<!-- Top supporters -->
						<template v-if="supportersData && supportersData.supporters.length">
							<AppTopSupportersCard
								:supporters="supportersData.supporters"
								:own-support="supportersData.ownSupport"
							/>
							<br />
						</template>

						<!-- Social links -->
						<template v-if="socialLinks.length">
							<template v-for="link of socialLinks" :key="link.label">
								<AppLinkExternal :href="link.url">
									<AppButton :icon="link.icon" block>
										{{ link.label }}
									</AppButton>
								</AppLinkExternal>

								<AppSpacer vertical :scale="1" />
							</template>
						</template>
					</template>

					<template #right>
						<AppUserFollowButton
							v-if="shouldShowFollow"
							:user="routeUser"
							block
							location="profilePage"
						/>
						<AppButton
							v-else-if="isMe"
							primary
							block
							:to="{
								name: 'dash.account.edit',
							}"
						>
							{{ $gettext(`Edit profile`) }}
						</AppButton>

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

						<AppButton
							v-if="Screen.isMobile && gamesCount > 0"
							block
							:to="{
								name: 'library.collection.developer',
								params: { id: routeUser.username },
							}"
						>
							{{ formatNumber(gamesCount) }} Games
						</AppButton>

						<AppSpacer vertical :scale="4" />

						<!-- TODO(profile-scrunch) Either scroll affix the ad or
						have the whole sidebar sticky. I'd prefer to have the
						sidebars sticky.  -->
						<!-- <AppScrollAffix
							:style="{
								position: `relative`,
								zIndex: kLayerAds,
							}"
							:padding="8"
						> -->
						<AppAdWidget
							:style="{
								...styleChangeBg('bg'),
								...styleElevate(3),
								// TODO(profile-scrunch) Can't do a static width like this, sidebars are flexible.
								// minWidth: `300px`,
								width: `300px`,
								maxWidth: `100%`,

								paddingTop: `8px`,
								paddingBottom: `8px`,
								borderRadius: kBorderRadiusLg.px,
								padding: `8px`,
							}"
							:size="isAdEnthused ? 'video' : 'rectangle'"
							placement="side"
						/>
						<!-- </AppScrollAffix> -->

						<AppSpacer vertical :scale="6" />

						<AppShareCard v-if="!myUser || !isMe" resource="user" :url="shareUrl" />
						<AppInviteCard v-else :user="myUser" />

						<AppUserKnownFollowers
							v-if="shouldShowKnownFollowers"
							:users="knownFollowers"
							:count="knownFollowerCount"
						/>

						<!-- TODO(profile-scrunch) -->
						<template v-if="false && hasQuickButtonsSection">
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

						<!-- Latest Games -->
						<template v-if="hasGamesSection">
							<AppSpacer vertical :scale="6" />

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
								:when="userFriendship.state === UserFriendshipState.RequestSent"
								animate-initial
							>
								<div class="alert">
									<p>
										{{
											$gettext(
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
								:when="userFriendship.state === UserFriendshipState.RequestReceived"
								animate-initial
							>
								<div class="alert">
									<p>
										{{
											$gettext(
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

						<!-- Floating header -->
						<!-- TODO(profile-scrunch) Maybe keep? -->
						<Transition>
							<AppProfileFloatingHeader v-if="Screen.isMobile && fadeUpHeader" />
						</Transition>

						<AppProfileShopButton v-if="hasSales" :user="routeUser" />

						<RouterView />
					</template>
				</AppPageContainer>
			</section>
		</AppShellPageBackdrop>
	</div>
</template>
