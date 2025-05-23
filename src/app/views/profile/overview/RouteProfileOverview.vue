<script lang="ts">
import { computed, Ref, ref } from 'vue';
import { RouteLocationRaw, RouterView, useRoute, useRouter } from 'vue-router';
import AppAdTakeoverFloat from '../../../../_common/ad/AppAdTakeoverFloat.vue';
import AppAdWidget from '../../../../_common/ad/widget/AppAdWidget.vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import {
	commentStoreCount,
	CommentStoreModel,
	lockCommentStore,
	releaseCommentStore,
	useCommentStoreManager,
} from '../../../../_common/comment/comment-store';
import { CommunityModel } from '../../../../_common/community/community.model';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { GameModel } from '../../../../_common/game/game.model';
import AppInviteCard from '../../../../_common/invite/AppInviteCard.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { LinkedAccountModel } from '../../../../_common/linked-account/linked-account.model';
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
		reloadOn: 'never',
		resolver: ({ route }) => Api.sendRequest('/web/profile/overview/@' + route.params.username),
	}),
};
</script>

<script lang="ts" setup>
const {
	isOverviewLoaded,
	gamesCount,
	userFriendship,
	user: routeUser,
	myUser,
	overviewPayload,
	acceptFriendRequest,
	rejectFriendRequest,
	removeFriend,
	cancelFriendRequest,
	stickySides,
	hasSales,
	isMe,
	showFullDescription,
	isFriend,
	linkedAccounts,
	shareUrl,
} = useProfileRouteStore()!;

const { grid } = useGridStore();

const route = useRoute();
const router = useRouter();

const commentManager = useCommentStoreManager()!;

const commentStore = ref<CommentStoreModel | null>(null);
const games = ref<GameModel[]>([]);
const communities = ref<CommunityModel[]>([]);
const supportersData = ref() as Ref<
	{ supporters: TopSupporter[]; ownSupport: OwnSupport } | undefined
>;

let permalinkWatchDeregister: CommentThreadModalPermalinkDeregister | undefined = undefined;

const routeTitle = computed(() => {
	if (routeUser.value) {
		return `${routeUser.value.display_name} (@${routeUser.value.username})`;
	}
	return null;
});

const userBlockedYou = computed(() => routeUser.value && routeUser.value.blocked_you);
const showSidebarAvatar = computed(() => stickySides.value || Screen.isMobile);

createAppRoute({
	routeTitle,
	onInit() {
		showFullDescription.value = false;
		games.value = [];
		communities.value = [];
		linkedAccounts.value = [];
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
		games.value = GameModel.populate(payload.developerGamesTeaser);
		communities.value = CommunityModel.populate(payload.communities);
		linkedAccounts.value = LinkedAccountModel.populate(payload.linkedAccounts);
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
						<AppAdTakeoverFloat>
							<template v-if="Screen.isMd">
								<AppProfileActionButtons />

								<AppSpacer vertical :scale="4" />
								<AppAdWidget
									:style="{
										...styleChangeBg('bg'),
										...styleElevate(3),
										// Can't change this, needs to be at least 300px wide.
										minWidth: `300px`,
										borderRadius: kBorderRadiusLg.px,
										padding: `8px`,
									}"
									size="rectangle"
									placement="side"
								/>
								<AppSpacer vertical :scale="6" />
							</template>

							<!-- Stats, Shortcuts, Bio -->
							<AppProfileInfoCard
								:style="{
									position: `relative`,
									zIndex: 2,
								}"
								:card-styles="{
									...styleWhen(Screen.isMobile, {
										borderTopLeftRadius: 0,
										borderTopRightRadius: 0,
									}),
								}"
								:show-avatar="showSidebarAvatar"
							/>

							<!-- Top supporters -->
							<template v-if="supportersData && supportersData.supporters.length">
								<AppTopSupportersCard
									:supporters="supportersData.supporters"
									:own-support="supportersData.ownSupport"
									inset-header
								/>
								<br v-if="Screen.isDesktop" />
							</template>
						</AppAdTakeoverFloat>
					</template>

					<template #right>
						<template v-if="Screen.isLg">
							<AppProfileActionButtons />

							<AppSpacer vertical :scale="4" />
							<AppAdWidget
								:style="{
									...styleChangeBg('bg'),
									...styleElevate(3),
									// Can't change this, needs to be at least 300px wide.
									minWidth: `300px`,
									borderRadius: kBorderRadiusLg.px,
									padding: `8px`,
								}"
								size="rectangle"
								placement="side"
							/>
							<AppSpacer vertical :scale="6" />
						</template>

						<AppSpacer v-if="Screen.isXs" :scale="4" vertical />

						<template v-if="Screen.isDesktop">
							<AppShareCard v-if="!myUser || !isMe" resource="user" :url="shareUrl" />
							<AppInviteCard v-else :user="myUser" />
						</template>

						<!-- Developer's Games -->
						<AppAdTakeoverFloat v-if="Screen.isDesktop && gamesCount > 0">
							<AppSpacer vertical :scale="6" />

							<div class="sheet">
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
										{{ $gettext(`Developer's Games`) }}
									</h4>
								</div>

								<AppGameListPlaceholder v-if="!isOverviewLoaded" :num="7" />
								<AppGameList
									v-else-if="games.length"
									:games="games"
									event-label="profile"
								/>
							</div>
						</AppAdTakeoverFloat>
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
