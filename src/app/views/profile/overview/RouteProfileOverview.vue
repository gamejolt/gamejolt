<script lang="ts">
import { Ref, computed, ref, toRef } from 'vue';
import { RouteLocationRaw, RouterView, useRoute, useRouter } from 'vue-router';
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
import AppTopSupportersCard, {
	OwnSupport,
	TopSupporter,
} from '../../../../_common/supporters/AppTopSupportersCard.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserFriendshipState } from '../../../../_common/user/friendship/friendship.model';
import { showUserInviteFollowModal } from '../../../../_common/user/invite/modal/modal.service';
import { $unfollowUser, UserModel } from '../../../../_common/user/user.model';
import { styleChangeBg, styleElevate, styleWhen } from '../../../../_styles/mixins';
import { kBorderRadiusLg } from '../../../../_styles/variables';
import { numberSort } from '../../../../utils/array';
import { removeQuery } from '../../../../utils/router';
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
import { useProfileRouteStore } from '../RouteProfile.vue';
import AppProfileActionButtons from './AppProfileActionButtons.vue';
import AppProfileInfoCard from './AppProfileInfoCard.vue';
import AppRouteProfileOverviewBanned from './AppRouteProfileOverviewBanned.vue';
import AppProfileShopButton from './shop/AppProfileShopButton.vue';

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
	// communitiesCount,
	// placeholderCommunitiesCount,
	userFriendship,
	// previewTrophies,
	// trophyCount,
	user: routeUser,
	myUser,
	overviewPayload,
	acceptFriendRequest,
	rejectFriendRequest,
	removeFriend,
	// sendFriendRequest,
	cancelFriendRequest,
	stickySides,
	// pageOffsetTop,
	hasSales,
	// pageScrollPositionThroughHeader,
	isMe,
	showFullDescription,
	// canToggleDescription,
	hasGamesSection,
	isFriend,
} = useProfileRouteStore()!;

const { grid } = useGridStore();

const route = useRoute();
const router = useRouter();

const commentManager = useCommentStoreManager()!;

const commentStore = ref<CommentStoreModel | null>(null);

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

const hasLinksSection = toRef(
	() =>
		routeUser.value &&
		((linkedAccounts.value && linkedAccounts.value.length > 0) || routeUser.value.web_site)
);
const twitchAccount = computed(() => getLinkedAccount(LinkedAccountProvider.Twitch));

const shouldShowKnownFollowers = toRef(
	() =>
		!!myUser.value &&
		!!routeUser.value &&
		isOverviewLoaded.value &&
		myUser.value.id !== routeUser.value.id
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

const showSidebarAvatar = toRef(() => stickySides.value || Screen.isMobile);
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
						<!-- Stats, Shortcuts, Bio -->
						<AppProfileInfoCard :show-avatar="showSidebarAvatar" />

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
						<AppProfileActionButtons v-if="Screen.isDesktop" />

						<AppSpacer vertical :scale="4" />

						<div :style="{ display: `flex` }">
							<AppAdWidget
								:style="{
									...styleChangeBg('bg'),
									...styleElevate(3),
									// Can't change this, needs to be at least 300px wide.
									minWidth: `300px`,
									paddingTop: `8px`,
									paddingBottom: `8px`,
									borderRadius: kBorderRadiusLg.px,
									padding: `8px`,
								}"
								:size="isAdEnthused ? 'video' : 'rectangle'"
								placement="side"
							/>
						</div>

						<AppSpacer vertical :scale="6" />

						<AppShareCard v-if="!myUser || !isMe" resource="user" :url="shareUrl" />
						<AppInviteCard v-else :user="myUser" />

						<AppUserKnownFollowers
							v-if="shouldShowKnownFollowers"
							:users="knownFollowers"
							:count="knownFollowerCount"
						/>

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

						<AppProfileShopButton v-if="hasSales" :user="routeUser" />

						<RouterView />
					</template>
				</AppPageContainer>
			</section>
		</AppShellPageBackdrop>
	</div>
</template>
