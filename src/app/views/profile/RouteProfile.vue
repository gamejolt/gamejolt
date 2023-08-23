<script lang="ts">
import { computed, CSSProperties, inject, InjectionKey, provide, ref } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { vAppTrackEvent } from '../../../_common/analytics/track-event.directive';
import { Api } from '../../../_common/api/api.service';
import { BlockModal } from '../../../_common/block/modal/modal.service';
import AppButton from '../../../_common/button/AppButton.vue';
import { Environment } from '../../../_common/environment/environment.service';
import { formatNumber } from '../../../_common/filters/number';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import AppPopper from '../../../_common/popper/AppPopper.vue';
import { Registry } from '../../../_common/registry/registry.service';
import { ReportModal } from '../../../_common/report/modal/modal.service';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { copyShareLink } from '../../../_common/share/share.service';
import { useCommonStore } from '../../../_common/store/common-store';
import { useThemeStore } from '../../../_common/theme/theme.store';
import AppTimeAgo from '../../../_common/time/AppTimeAgo.vue';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../_common/translate/translate.service';
import AppUserDogtag from '../../../_common/user/AppUserDogtag.vue';
import AppUserFollowButton from '../../../_common/user/follow/AppUserFollowButton.vue';
import {
	UserFriendship,
	UserFriendshipState,
} from '../../../_common/user/friendship/friendship.model';
import { populateTrophies } from '../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophy } from '../../../_common/user/trophy/user-base-trophy.model';
import { User } from '../../../_common/user/user.model';
import { kFontFamilyBase } from '../../../_styles/variables';
import { isUserOnline } from '../../components/chat/client';
import { CommentModal } from '../../components/comment/modal/modal.service';
import { useGridStore } from '../../components/grid/grid-store';
import { IntentService } from '../../components/intent/intent.service';
import AppPageHeader from '../../components/page-header/AppPageHeader.vue';
import AppPageHeaderAvatar from '../../components/page-header/AppPageHeaderAvatar.vue';
import AppPageHeaderControls from '../../components/page-header/controls/controls.vue';
import AppUserBlockOverlay from '../../components/user/block-overlay/block-overlay.vue';
import { UserFriendshipHelper } from '../../components/user/friendships-helper/friendship-helper.service';

const Key: InjectionKey<Controller> = Symbol('profile-route');

type Controller = ReturnType<typeof createController>;

export function useProfileRouteController() {
	return inject(Key);
}

function createController() {
	const isOverviewLoaded = ref(false);

	// We will bootstrap this right away, so it should always be set for use.
	const user = ref<User>();

	const gamesCount = ref(0);
	const communitiesCount = ref(0);
	const placeholderCommunitiesCount = ref(0);
	const trophyCount = ref(0);
	const userFriendship = ref<UserFriendship>();
	const previewTrophies = ref<UserBaseTrophy[]>([]);

	function _updateUser(newUser?: User) {
		// If we already have a user, just assign new data into it to keep it
		// fresh.
		if (user.value && newUser && user.value.id === newUser.id) {
			user.value.assign(newUser);
		} else {
			user.value = newUser;
		}
	}

	async function sendFriendRequest() {
		if (user.value) {
			_setUserFriendship(await UserFriendshipHelper.sendRequest(user.value));
			// We follow the user after sending the friend request.
			if (!user.value.is_following) {
				user.value.is_following = true;
				user.value.follower_count++;
			}
		}
	}

	async function acceptFriendRequest() {
		if (userFriendship.value) {
			const accepted = await UserFriendshipHelper.acceptRequest(userFriendship.value);
			if (accepted) {
				_setUserFriendship(userFriendship.value);
				// We follow the user after accepting the friend request.
				if (user.value && !user.value.is_following) {
					user.value.is_following = true;
					user.value.follower_count++;
				}
			} else {
				_setUserFriendship(undefined);
			}
		}
	}

	async function cancelFriendRequest() {
		if (userFriendship.value) {
			if (!(await UserFriendshipHelper.cancelRequest(userFriendship.value))) {
				return false;
			}
		}
		_setUserFriendship(undefined);
		return true;
	}

	async function rejectFriendRequest() {
		if (userFriendship.value) {
			if (!(await UserFriendshipHelper.rejectRequest(userFriendship.value))) {
				return false;
			}
		}
		_setUserFriendship(undefined);
		return true;
	}

	async function removeFriend() {
		if (userFriendship.value) {
			if (!(await UserFriendshipHelper.removeFriend(userFriendship.value))) {
				return;
			}
		}
		_setUserFriendship(undefined);
	}

	function bootstrapUser(username: string) {
		const prevId = user.value?.id;
		const newUser =
			Registry.find<User>('User', i => i.username.toLowerCase() === username.toLowerCase()) ??
			undefined;

		_updateUser(newUser);

		if (user.value?.id !== prevId) {
			isOverviewLoaded.value = false;
			gamesCount.value = 0;
			communitiesCount.value = 0;
			placeholderCommunitiesCount.value = 0;
			trophyCount.value = 0;
			userFriendship.value = undefined;
			previewTrophies.value = [];
		}
	}

	function profilePayload(payload: any) {
		const newUser = new User(payload.user);
		_updateUser(newUser);

		gamesCount.value = payload.gamesCount || 0;
		communitiesCount.value = payload.communitiesCount || 0;
		placeholderCommunitiesCount.value = payload.placeholderCommunitiesCount || 0;
		trophyCount.value = payload.trophyCount || 0;

		userFriendship.value = payload.userFriendship
			? new UserFriendship(payload.userFriendship)
			: undefined;

		previewTrophies.value = payload.previewTrophies
			? populateTrophies(payload.previewTrophies)
			: [];
	}

	function overviewPayload(_payload: any) {
		// This is the only thing we care about globally.
		isOverviewLoaded.value = true;
	}

	function _setUserFriendship(friendship?: UserFriendship) {
		userFriendship.value = friendship;
	}

	return {
		isOverviewLoaded,
		user,
		gamesCount,
		communitiesCount,
		placeholderCommunitiesCount,
		trophyCount,
		userFriendship,
		previewTrophies,
		sendFriendRequest,
		acceptFriendRequest,
		cancelFriendRequest,
		rejectFriendRequest,
		removeFriend,
		bootstrapUser,
		profilePayload,
		overviewPayload,
	};
}

const ProfileThemeKey = 'profile';
</script>

<script lang="ts" setup>
defineOptions(
	defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: { params: ['username'], query: ['intent'] },
		async resolver({ route }) {
			const intentRedirect = IntentService.checkRoute(
				route,
				{
					intent: 'follow-user',
					message: $gettext(`You're now following this user.`),
				},
				{
					intent: 'accept-friend-request',
					message: $gettext(`You are now friends with this user!`),
				},
				{
					intent: 'decline-friend-request',
					message: $gettext(`You've declined this user's friend request.`),
				}
			);
			if (intentRedirect) {
				return intentRedirect;
			}
			return Api.sendRequest('/web/profile/@' + route.params.username);
		},
	})
);

const routeStore = createController();
provide(Key, routeStore);

const { user: routeUser, trophyCount, userFriendship, bootstrapUser, profilePayload } = routeStore;

const { user: myUser } = useCommonStore();
const { setPageTheme: setThemeStorePageTheme, clearPageTheme } = useThemeStore();
const { chat } = useGridStore();

const route = useRoute();
const router = useRouter();

/**
 * The cover height changes when we switch to not showing the full cover, so
 * let's make sure we reset the autoscroll anchor so that it scrolls to the
 * top again.
 */
const autoscrollAnchorKey = computed(() => routeUser.value!.id);

const commentsCount = computed(() => {
	if (routeUser.value && routeUser.value.comment_count) {
		return routeUser.value.comment_count;
	}
	return 0;
});

const canBlock = computed(
	() =>
		routeUser.value &&
		!routeUser.value.is_blocked &&
		myUser.value &&
		routeUser.value.id !== myUser.value.id
);

const shouldShowFollow = computed(
	() =>
		myUser.value &&
		routeUser.value &&
		myUser.value.id !== routeUser.value.id &&
		!routeUser.value.is_blocked &&
		!routeUser.value.blocked_you
);

const shouldShowEdit = computed(
	() => myUser.value && routeUser.value && myUser.value.id === routeUser.value.id
);

const isOnline = computed<null | boolean>(() => {
	if (!chat.value || !routeUser.value) {
		return null;
	}

	return isUserOnline(chat.value, routeUser.value.id);
});

const { isBootstrapped } = createAppRoute({
	onInit() {
		// This isn't needed by SSR or anything, so it's fine to call it here.
		bootstrapUser(route.params.username.toString());
		setPageTheme();
	},
	onResolved({ payload }) {
		profilePayload(payload);
		setPageTheme();
	},
	onDestroyed() {
		clearPageTheme(ProfileThemeKey);
	},
});

function setPageTheme() {
	const theme = routeUser.value?.theme ?? null;
	setThemeStorePageTheme({
		key: ProfileThemeKey,
		theme,
	});
}

function showComments() {
	if (routeUser.value) {
		CommentModal.show({
			model: routeUser.value,
			displayMode: 'shouts',
		});
	}
}

function copyShareUrl() {
	if (!routeUser.value) {
		return;
	}
	const url = Environment.baseUrl + routeUser.value.url;
	copyShareLink(url, 'user');
}

function report() {
	if (routeUser.value) {
		ReportModal.show(routeUser.value);
	}
}

async function blockUser() {
	if (routeUser.value) {
		const result = await BlockModal.show(routeUser.value);

		// Navigate away from the page after blocking.
		if (result) {
			router.push({
				name: 'dash.account.blocks',
			});
		}
	}
}

const headingStyles: CSSProperties = {
	marginBottom: `4px`,
	display: `flex`,
	alignItems: `center`,
};

const headingUsernameStyles = computed<CSSProperties>(() => ({
	fontSize: `19px`,
	fontFamily: kFontFamilyBase,
	fontWeight: `bold`,
	marginLeft: `8px`,
}));
</script>

<template>
	<div v-if="routeUser">
		<!--
			If this user is banned, we show very little.
		-->
		<template v-if="!routeUser.status">
			<AppPageHeader>
				<h1 :style="headingStyles">
					{{ routeUser.display_name }}
					<small :style="headingUsernameStyles">@{{ routeUser.username }}</small>
				</h1>

				<div class="text-muted small">
					{{ $gettext(`Joined`) }}
					{{ ' ' }}
					<AppTimeAgo :date="routeUser.created_on" />
				</div>
			</AppPageHeader>

			<RouterView />
		</template>
		<template v-else>
			<AppUserBlockOverlay :user="routeUser">
				<AppPageHeader
					:cover-media-item="routeUser.header_media_item"
					:cover-max-height="400"
					should-affix-nav
					:autoscroll-anchor-key="autoscrollAnchorKey"
				>
					<RouterLink
						:to="{
							name: 'profile.overview',
							params: { username: routeUser.username },
						}"
					>
						<h1 :style="headingStyles">
							{{ routeUser.display_name }}
							<span :style="headingUsernameStyles">@{{ routeUser.username }}</span>
						</h1>
					</RouterLink>
					<div>
						<!-- Joined on -->
						{{ $gettext(`Joined`) }}
						{{ ' ' }}
						<AppTimeAgo :date="routeUser.created_on" />

						<template v-if="isBootstrapped">
							<span class="dot-separator" />

							<!-- Dogtags -->
							<AppUserDogtag
								v-for="tag of routeUser.dogtags"
								:key="tag.text"
								:tag="tag"
							/>

							<!-- Friend status -->
							<span
								v-if="
									userFriendship &&
									userFriendship.state === UserFriendshipState.Friends
								"
								v-app-tooltip="$gettext('You are friends! Awwww!')"
								class="tag tag-highlight"
							>
								{{ $gettext(`Friend`) }}
							</span>

							<!-- Online status -->
							<template v-if="isOnline !== null">
								<span
									v-if="isOnline === false"
									v-app-tooltip="$gettext('This user is currently offline.')"
									class="tag"
								>
									{{ $gettext(`Offline`) }}
								</span>
								<span
									v-else
									v-app-tooltip="$gettext('This user is currently online.')"
									class="tag tag-highlight"
								>
									{{ $gettext(`Online`) }}
								</span>
							</template>

							<!-- Following status -->
							<span
								v-if="routeUser.follows_you"
								v-app-tooltip="$gettext('This user is following you.')"
								class="tag tag-highlight"
							>
								{{ $gettext(`Follows you`) }}
							</span>
						</template>
					</div>

					<template #spotlight>
						<AppPageHeaderAvatar :user="routeUser" />
					</template>

					<template #nav>
						<nav class="platform-list inline">
							<ul>
								<li>
									<RouterLink
										:to="{ name: 'profile.overview' }"
										:class="{ active: route.name === 'profile.overview' }"
									>
										{{ $gettext(`Profile`) }}
									</RouterLink>
								</li>
								<li>
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
								</li>
								<!--
									We only need to show this on mobile.
								-->
								<li v-if="routeUser.shouts_enabled && Screen.isMobile">
									<a @click="showComments()">
										{{ $gettext(`Shouts`) }}
										<span class="badge">
											{{ formatNumber(commentsCount) }}
										</span>
									</a>
								</li>
								<li>
									<RouterLink
										:to="{ name: 'profile.library' }"
										active-class="active"
									>
										{{ $gettext(`Library`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: 'profile.trophies' }"
										active-class="active"
									>
										{{ $gettext(`Trophies`) }}
										<span class="badge">
											{{ formatNumber(trophyCount) }}
										</span>
									</RouterLink>
								</li>
								<li>
									<AppPopper popover-class="fill-darkest">
										<a>
											<AppJolticon icon="ellipsis-v" />
										</a>

										<template #popover>
											<div class="list-group list-group-dark">
												<a
													v-app-track-event="`copy-link:user`"
													class="list-group-item has-icon"
													@click="copyShareUrl"
												>
													<AppJolticon icon="link" />
													{{ $gettext(`Copy link to user`) }}
												</a>
												<a
													v-if="myUser && routeUser.id !== myUser.id"
													class="list-group-item has-icon"
													@click="report"
												>
													<AppJolticon icon="flag" />
													{{ $gettext(`Report user`) }}
												</a>
												<a
													v-if="
														userFriendship &&
														userFriendship.state ===
															UserFriendshipState.Friends
													"
													class="list-group-item has-icon"
													@click="routeStore.removeFriend()"
												>
													<AppJolticon icon="friend-remove-1" notice />
													{{ $gettext(`Remove friend`) }}
												</a>
												<a
													v-if="canBlock"
													class="list-group-item has-icon"
													@click="blockUser"
												>
													<AppJolticon icon="friend-remove-2" notice />
													{{ $gettext(`Block user`) }}
												</a>
												<a
													v-if="myUser && myUser.permission_level > 0"
													class="list-group-item has-icon"
													:href="`${Environment.baseUrl}/moderate/users/view/${routeUser.id}`"
													target="_blank"
												>
													<AppJolticon icon="cog" />
													{{ $gettext(`Moderate user`) }}
												</a>
											</div>
										</template>
									</AppPopper>
								</li>
							</ul>
						</nav>
					</template>

					<template #controls>
						<AppPageHeaderControls>
							<AppUserFollowButton
								v-if="shouldShowFollow"
								:user="routeUser"
								block
								location="profilePage"
							/>
							<AppButton
								v-else-if="shouldShowEdit"
								primary
								block
								:to="{
									name: 'dash.account.edit',
								}"
							>
								{{ $gettext(`Edit profile`) }}
							</AppButton>
						</AppPageHeaderControls>
					</template>
				</AppPageHeader>

				<RouterView />
			</AppUserBlockOverlay>
		</template>
	</div>
</template>
