<script lang="ts">
import { Ref, computed, ref, toRef } from 'vue';
import { RouteLocationRaw, RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import { isAdEnthused } from '../../../../_common/ad/ad-store';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import { Api } from '../../../../_common/api/api.service';
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import { CommentModel } from '../../../../_common/comment/comment-model';
import {
	CommentStoreModel,
	commentStoreCount,
	lockCommentStore,
	releaseCommentStore,
	useCommentStoreManager,
} from '../../../../_common/comment/comment-store';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppCommunityThumbnailImg from '../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import AppCommunityVerifiedTick from '../../../../_common/community/verified-tick/AppCommunityVerifiedTick.vue';
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
import { storeModelList } from '../../../../_common/model/model-store.service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollAffix from '../../../../_common/scroll/AppScrollAffix.vue';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTopSupportersCard, {
	OwnSupport,
	TopSupporter,
} from '../../../../_common/supporters/AppTopSupportersCard.vue';
import { kThemeFg, kThemeFg10 } from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import { showTrophyModal } from '../../../../_common/trophy/modal/modal.service';
import AppTrophyThumbnail from '../../../../_common/trophy/thumbnail/AppTrophyThumbnail.vue';
import { UserFriendshipState } from '../../../../_common/user/friendship/friendship.model';
import { showUserInviteFollowModal } from '../../../../_common/user/invite/modal/modal.service';
import { UserBaseTrophyModel } from '../../../../_common/user/trophy/user-base-trophy.model';
import { $unfollowUser, UserModel } from '../../../../_common/user/user.model';
import { styleChangeBg, styleElevate } from '../../../../_styles/mixins';
import { kBorderRadiusLg, kFontSizeSmall, kLayerAds } from '../../../../_styles/variables';
import { numberSort } from '../../../../utils/array';
import { removeQuery } from '../../../../utils/router';
import { openChatRoom } from '../../../components/chat/client';
import AppCommentOverview from '../../../components/comment/AppCommentOverview.vue';
import AppCommentAddButton from '../../../components/comment/add-button/AppCommentAddButton.vue';
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
import AppRouteProfileOverviewBanned from './AppRouteProfileOverviewBanned.vue';
import AppProfileShopButton from './shop/AppProfileShopButton.vue';

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
const showAllCommunities = ref(false);
const isLoadingAllCommunities = ref(false);
const games = ref<GameModel[]>([]);
const communities = ref<CommunityModel[]>([]);
const allCommunities = ref<CommunityModel[] | null>(null);
const supportersData = ref() as Ref<
	{ supporters: TopSupporter[]; ownSupport: OwnSupport } | undefined
>;
const hasSales = ref(false);
const overviewComments = ref<CommentModel[]>([]);
const linkedAccounts = ref<LinkedAccountModel[]>([]);
const knownFollowers = ref<UserModel[]>([]);
const knownFollowerCount = ref(0);

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
const commentsCount = toRef(() =>
	routeUser.value && routeUser.value.comment_count ? routeUser.value.comment_count : 0
);
const shouldShowShouts = toRef(
	() => routeUser.value && !Screen.isMobile && routeUser.value.shouts_enabled
);

const isFriend = toRef(
	() => userFriendship.value && userFriendship.value.state === UserFriendshipState.Friends
);

const canMessage = toRef(() => isFriend.value && chat.value && chat.value.connected);

const previewCommunityCount = toRef(() =>
	isLoadingAllCommunities.value ? communitiesCount.value : placeholderCommunitiesCount.value
);
const canShowMoreCommunities = toRef(() => communitiesCount.value > communities.value.length);
const shownCommunities = toRef(() =>
	showAllCommunities.value && allCommunities.value ? allCommunities.value : communities.value
);

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
const shouldShowMoreTrophies = toRef(
	() => shouldShowTrophies.value && trophyCount.value > previewTrophies.value!.length
);
const moreTrophyCount = toRef(
	() => trophyCount.value - (previewTrophies.value ? previewTrophies.value.length : 0)
);
const shouldShowShoutAdd = toRef(() => routeUser.value && routeUser.value.canMakeComment);

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
		showAllCommunities.value = false;
		isLoadingAllCommunities.value = false;
		games.value = [];
		communities.value = [];
		allCommunities.value = null;
		linkedAccounts.value = [];
		overviewComments.value = [];
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
		showAllCommunities.value = false;
		isLoadingAllCommunities.value = false;
		games.value = GameModel.populate(payload.developerGamesTeaser);
		communities.value = CommunityModel.populate(payload.communities);
		linkedAccounts.value = LinkedAccountModel.populate(payload.linkedAccounts);
		overviewComments.value = storeModelList(CommentModel, payload.comments);
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

function showComments() {
	if (routeUser.value) {
		showCommentModal({
			model: routeUser.value,
			displayMode: 'shouts',
		});
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
			allCommunities.value = CommunityModel.populate(payload.communities);
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
		overviewComments.value = storeModelList(CommentModel, $payload.comments);
		routeUser.value.comment_count = $payload.count;
	}
}

function onClickTrophy(userTrophy: UserBaseTrophyModel) {
	showTrophyModal(userTrophy);
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

interface ProfileStat {
	label: string;
	value: string;
	link?: RouteLocationRaw;
}

const stats = computed<ProfileStat[]>(() => [
	{
		label: $gettext('Following'),
		value: formatNumber(routeUser.value?.following_count || 0),
		link: {
			name: 'profile.following',
		},
	},
	{
		label: $gettext('Followers'),
		value: formatNumber(routeUser.value?.follower_count || 0),
		link: {
			name: 'profile.followers',
		},
	},
	{
		label: $gettext('Likes'),
		value: formatNumber(routeUser.value?.like_count || 0),
	},
]);

interface ProfileQuickLink {
	label: string;
	icon: Jolticon;
	link: RouteLocationRaw;
}

const quickLinks = computed<ProfileQuickLink[]>(() => {
	const items: ProfileQuickLink[] = [];

	if (!routeUser.value) {
		return items;
	}

	if (shouldShowShouts.value) {
		items.push({
			label: $gettext(`Shouts`),
			icon: 'comment-filled',
			// TODO
			link: {
				name: 'library.collection.developer',
				params: { id: routeUser.value.username },
			},
		});
	}

	if (hasGamesSection.value) {
		items.push({
			label: $gettext(`Games`),
			icon: 'gamepad',
			link: {
				name: 'library.collection.developer',
				params: { id: routeUser.value.username },
			},
		});
	}

	if (shouldShowTrophies.value) {
		items.push({
			label: $gettext(`Trophies`),
			icon: 'trophy',
			// TODO
			link: { name: 'profile.trophies' },
		});
	}

	if (hasCommunitiesSection.value) {
		items.push({
			label: $gettext(`Communities`),
			icon: 'communities',
			// TODO
			link: {
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
</script>

<template>
	<div v-if="routeUser">
		<!-- If they're banned, show very litte -->
		<AppRouteProfileOverviewBanned
			v-if="!routeUser.status"
			:user="routeUser"
			:is-friend="isFriend"
			@removefriend="removeFriend()"
			@unfollow="onClickUnfollow()"
		/>
		<AppShellPageBackdrop v-else>
			<section class="section">
				<AppPageContainer xl order="left,main,right">
					<template #left>
						<!-- <li>
							<RouterLink
								:to="{ name: 'profile.following' }"
								active-class="active"
							>
								{{ $gettext(`Following`) }}
								<span class="badge">
									{{ formatNumber(routeUser.following_count) }}
								</span>
							</RouterLink>
						</li>
						<li>
							<RouterLink
								:to="{ name: 'profile.followers' }"
								active-class="active"
							>
								{{ $gettext(`Followers`) }}
								<span class="badge">
									{{ formatNumber(routeUser.follower_count) }}
								</span>
							</RouterLink>
						</li> -->

						<!-- Stats -->
						<div class="sheet">
							<div
								:style="{
									display: `flex`,
									flexDirection: `row`,
									justifyContent: `space-around`,
								}"
							>
								<template v-for="stat of stats" :key="stat.label">
									<component
										:is="stat.link ? RouterLink : 'div'"
										class="stat-big stat-big-smaller text-center"
										:class="{
											'link-unstyled': stat.link,
										}"
										:style="{
											flex: 1,
											marginBottom: 0,
										}"
										:to="stat.link"
									>
										<div class="stat-big-digit">
											{{ stat.value }}
										</div>
										<div class="stat-big-label">
											{{ stat.label }}
										</div>
									</component>
								</template>
							</div>

							<!-- <div
								:style="{
									margin: `20px -20px`,
									height: `1px`,
									backgroundColor: kThemeFg10,
								}"
							/> -->
						</div>

						<!-- Bio -->
						<div class="sheet">
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
						</div>

						<!-- Top supporters -->
						<template v-if="supportersData && supportersData.supporters.length">
							<AppTopSupportersCard
								:supporters="supportersData.supporters"
								:own-support="supportersData.ownSupport"
							/>
							<br />
						</template>

						<!-- Quick links -->
						<div class="sheet">
							<div
								:style="{
									display: `flex`,
									flexDirection: `row`,
									justifyContent: `space-around`,
								}"
							>
								<template v-for="stat of stats" :key="stat.label">
									<component
										:is="stat.link ? RouterLink : 'div'"
										class="stat-big stat-big-smaller text-center"
										:class="{
											'link-unstyled': stat.link,
										}"
										:style="{
											flex: 1,
											marginBottom: 0,
										}"
										:to="stat.link"
									>
										<div class="stat-big-digit">
											{{ stat.value }}
										</div>
										<div class="stat-big-label">
											{{ stat.label }}
										</div>
									</component>
								</template>
							</div>

							<div
								:style="{
									margin: `20px -20px`,
									height: `1px`,
									backgroundColor: kThemeFg10,
								}"
							/>

							<div
								:style="{
									display: `flex`,
									flexDirection: `row`,
									justifyContent: `space-around`,
								}"
							>
								<RouterLink
									v-for="link of quickLinks"
									:key="link.label"
									:style="{
										display: `flex`,
										flexDirection: `column`,
										alignItems: `center`,
										flex: 1,
										gap: `4px`,
										color: kThemeFg,
									}"
									:to="link.link"
								>
									<AppJolticon :icon="link.icon" :style="{ fontSize: `28px` }" />
									<div
										:style="{
											fontWeight: `bold`,
											fontSize: kFontSizeSmall.px,
										}"
									>
										{{ link.label }}
									</div>
								</RouterLink>
							</div>
						</div>

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

					<template #left-bottom>
						<!-- Shouts -->
						<template v-if="false && shouldShowShouts">
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

						<!-- Communities -->
						<template v-if="false && hasCommunitiesSection">
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

							<span class="_communities">
								<template v-if="!isOverviewLoaded || isLoadingAllCommunities">
									<div
										v-for="i in previewCommunityCount"
										:key="i"
										class="_community-item _community-thumb-placeholder"
									>
										<AppAspectRatio :ratio="1" />
									</div>
								</template>
								<template v-else>
									<RouterLink
										v-for="community of shownCommunities"
										:key="community.id"
										v-app-tooltip.bottom="community.name"
										class="_community-item link-unstyled"
										:to="community.routeLocation"
									>
										<div class="_community-item-align">
											<AppCommunityThumbnailImg
												class="-community-thumb"
												:community="community"
											/>
											<AppCommunityVerifiedTick
												class="_community-verified-tick"
												:community="community"
												no-tooltip
											/>
										</div>
									</RouterLink>
								</template>
							</span>

							<br />
						</template>
					</template>

					<template #right>
						<AppScrollAffix
							:style="{
								position: `relative`,
								zIndex: kLayerAds,
							}"
							:padding="8"
						>
							<AppAdWidget
								:style="{
									...styleChangeBg('bg'),
									...styleElevate(3),
									minWidth: `300px`,
									paddingTop: `8px`,
									paddingBottom: `8px`,
									borderRadius: kBorderRadiusLg.px,
									padding: `8px`,
								}"
								:size="isAdEnthused ? 'video' : 'rectangle'"
								placement="side"
							/>
						</AppScrollAffix>

						<AppSpacer vertical :scale="6" />

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

						<!-- Trophies -->
						<template v-if="false && shouldShowTrophies">
							<h4 class="section-header">
								{{ $gettext(`Trophies`) }}
							</h4>

							<div class="_trophies">
								<template v-if="previewTrophies.length">
									<AppTrophyThumbnail
										v-for="trophy of previewTrophies"
										:key="trophy.key"
										class="_trophy"
										:trophy="trophy.trophy!"
										no-difficulty
										no-highlight
										@click="onClickTrophy(trophy)"
									/>
								</template>

								<RouterLink
									v-if="shouldShowMoreTrophies"
									v-app-tooltip="$gettext(`View All Trophies...`)"
									class="_trophies-more _trophy link-unstyled"
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
								:when="userFriendship.state === UserFriendshipState.RequestSent"
								:animate-initial="true"
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
								:animate-initial="true"
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

						<AppProfileShopButton v-if="hasSales" :user="routeUser" />

						<RouterView />
					</template>
				</AppPageContainer>
			</section>
		</AppShellPageBackdrop>
	</div>
</template>

<style lang="stylus" scoped>
._supporters-card
	rounded-corners-lg()
	change-bg('bg')
	padding: 12px 16px
	display: flex
	gap: 16px

._supporter
	flex: 1
	display: flex
	flex-direction: column
	align-items: center
	justify-content: flex-end
	min-width: 0
	color: var(--theme-fg)

._supporter-avatar
	width: 100%
	max-width: 56px

._supporter-username
	text-overflow()
	max-width: 100%
	min-width: 0
	font-size: $font-size-small

._supporter-value
	rounded-corners()
	change-bg('bg-offset')
	min-width: 32px
	padding: 0px 6px
	font-weight: bold
	display: inline-flex
	justify-content: center
	font-size: $font-size-small

._communities
	display: grid
	grid-template-columns: repeat(5, minmax(55px, 1fr))
	grid-gap: 8px

._community-item
	pressy()
	display: inline-block
	position: relative
	outline: 0
	width: 100%

._community-thumb-placeholder
	img-circle()
	change-bg('bg-subtle')

._community-verified-tick
	position: absolute
	right: -3px
	bottom: -1px
	change-bg('bg-offset')
	border-radius: 50%

._trophies
	display: grid
	grid-template-columns: repeat(5, 55px)
	grid-gap: 5px 10px

._trophies-more
	change-bg('bg-offset')
	rounded-corners-lg()
	display: flex !important
	justify-content: center
	align-items: center
	font-size: $font-size-h4
	user-select: none

	&:hover
		text-decoration: none

._trophy
	width: 55px
	height: 55px
	pressy()
	display: inline-block
	position: relative
	cursor: pointer
</style>
