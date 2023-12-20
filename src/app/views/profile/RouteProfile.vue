<script lang="ts">
import { computed, CSSProperties, inject, InjectionKey, provide, Ref, ref, toRef } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { Api } from '../../../_common/api/api.service';
import { watched } from '../../../_common/reactivity-helpers';
import { Registry } from '../../../_common/registry/registry.service';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { getPageScrollSubscription } from '../../../_common/scroll/scroll.service';
import { useCommonStore } from '../../../_common/store/common-store';
import { useThemeStore } from '../../../_common/theme/theme.store';
import AppTimeAgo from '../../../_common/time/AppTimeAgo.vue';
import { $gettext } from '../../../_common/translate/translate.service';
import {
	UserFriendshipModel,
	UserFriendshipState,
} from '../../../_common/user/friendship/friendship.model';
import { populateTrophies } from '../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophyModel } from '../../../_common/user/trophy/user-base-trophy.model';
import { UserModel } from '../../../_common/user/user.model';
import { kFontFamilyBase } from '../../../_styles/variables';
import { useResizeObserver } from '../../../utils/resize-observer';
import { ChatClient, isUserOnline } from '../../components/chat/client';
import { useGridStore } from '../../components/grid/grid-store';
import { IntentService } from '../../components/intent/intent.service';
import AppPageHeader from '../../components/page-header/AppPageHeader.vue';
import AppPageHeaderAvatar from '../../components/page-header/AppPageHeaderAvatar.vue';
import AppUserBlockOverlay from '../../components/user/block-overlay/block-overlay.vue';
import { UserFriendshipHelper } from '../../components/user/friendships-helper/friendship-helper.service';
import AppProfileDogtags from './dogtags/AppProfileDogtags.vue';

const ProfileRouteStoreKey: InjectionKey<ProfileRouteStore> = Symbol('profile-route');

type ProfileRouteStore = ReturnType<typeof createProfileRouteStore>;

export function useProfileRouteStore() {
	return inject(ProfileRouteStoreKey);
}

function createProfileRouteStore({
	header: refHeader,
	chat,
	myUser,
}: {
	header: Ref<HTMLElement | undefined>;
	chat: Ref<ChatClient | undefined>;
	myUser: Ref<UserModel | null | undefined>;
}) {
	const isOverviewLoaded = ref(false);

	// We will bootstrap this right away, so it should always be set for use.
	const user = ref<UserModel>();

	const isMe = toRef(() => myUser.value && user.value && myUser.value.id === user.value.id);

	const gamesCount = ref(0);
	const communitiesCount = ref(0);
	const placeholderCommunitiesCount = ref(0);
	const trophyCount = ref(0);
	const userFriendship = ref<UserFriendshipModel>();
	const previewTrophies = ref<UserBaseTrophyModel[]>([]);
	const hasSales = ref(false);

	const showFullDescription = ref(false);
	const canToggleDescription = ref(false);

	const hasGamesSection = toRef(() => !Screen.isMobile && gamesCount.value > 0);
	const hasCommunitiesSection = toRef(() => !Screen.isMobile && communitiesCount.value > 0);
	const shouldShowShouts = toRef(
		() => user.value && !Screen.isMobile && user.value.shouts_enabled
	);
	const shouldShowTrophies = toRef(
		() => !Screen.isMobile && !!previewTrophies.value && previewTrophies.value.length > 0
	);
	const isFriend = toRef(
		() => userFriendship.value && userFriendship.value.state === UserFriendshipState.Friends
	);

	const isOnline = computed<null | boolean>(() => {
		if (!chat.value || !user.value) {
			return null;
		}

		return isUserOnline(chat.value, user.value.id);
	});

	const _headerHeight = ref(0);
	// TODO(profile-scrunch) move this and stickySides into overview, not needed
	// for any other sub-routes.
	const { top: pageOffsetTop } = getPageScrollSubscription();

	const stickySides = watched(() => {
		if (_headerHeight.value <= 0) {
			return false;
		}
		return pageOffsetTop.value >= _headerHeight.value;
	});

	// Watch for changes with the header so we know how far we need to scroll
	// before hitting the actual page content.
	useResizeObserver({
		target: refHeader,
		callback([entry]) {
			_headerHeight.value = entry.contentRect.height;
		},
	});

	function _updateUser(newUser?: UserModel) {
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
			Registry.find<UserModel>(
				'User',
				i => i.username.toLowerCase() === username.toLowerCase()
			) ?? undefined;

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
		const newUser = new UserModel(payload.user);
		_updateUser(newUser);

		gamesCount.value = payload.gamesCount || 0;
		communitiesCount.value = payload.communitiesCount || 0;
		placeholderCommunitiesCount.value = payload.placeholderCommunitiesCount || 0;
		trophyCount.value = payload.trophyCount || 0;

		userFriendship.value = payload.userFriendship
			? new UserFriendshipModel(payload.userFriendship)
			: undefined;

		previewTrophies.value = payload.previewTrophies
			? populateTrophies(payload.previewTrophies)
			: [];
	}

	function overviewPayload(_payload: any) {
		// This is the only thing we care about globally.
		isOverviewLoaded.value = true;
	}

	function _setUserFriendship(friendship?: UserFriendshipModel) {
		userFriendship.value = friendship;
	}

	return {
		isOverviewLoaded,
		user,
		myUser,
		isMe,
		gamesCount,
		communitiesCount,
		placeholderCommunitiesCount,
		trophyCount,
		userFriendship,
		previewTrophies,
		hasSales,
		showFullDescription,
		canToggleDescription,
		hasGamesSection,
		hasCommunitiesSection,
		shouldShowShouts,
		shouldShowTrophies,
		isFriend,
		isOnline,
		pageOffsetTop,
		stickySides,
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

const header = ref<HTMLElement>();
const { chat } = useGridStore();
const { user: myUser } = useCommonStore();
const { setPageTheme: setThemeStorePageTheme, clearPageTheme } = useThemeStore();

const routeStore = createProfileRouteStore({ myUser, header, chat });
provide(ProfileRouteStoreKey, routeStore);

const { user: routeUser, bootstrapUser, profilePayload, stickySides } = routeStore;

const route = useRoute();

/**
 * The cover height changes when we switch to not showing the full cover, so
 * let's make sure we reset the autoscroll anchor so that it scrolls to the
 * top again.
 */
const autoscrollAnchorKey = toRef(() => routeUser.value!.id);

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

const headingStyles: CSSProperties = {
	marginBottom: `4px`,
	display: `flex`,
	alignItems: `center`,
};

const headingUsernameStyles: CSSProperties = {
	fontSize: `19px`,
	fontFamily: kFontFamilyBase,
	fontWeight: `bold`,
	marginLeft: `8px`,
};

const coverMaxHeight = computed(() => Math.min(Screen.height * 0.35, 400));
</script>

<template>
	<div v-if="routeUser">
		<!-- If they're banned, show very little -->
		<template v-if="!routeUser.status">
			<AppPageHeader>
				<h1 :style="headingStyles">
					{{ routeUser.display_name }}
					<small :style="headingUsernameStyles">@{{ routeUser.username }}</small>
				</h1>
			</AppPageHeader>

			<RouterView />
		</template>
		<template v-else>
			<AppUserBlockOverlay :user="routeUser">
				<div ref="header">
					<AppPageHeader
						:cover-media-item="routeUser.header_media_item"
						:cover-max-height="coverMaxHeight"
						should-affix-nav
						:autoscroll-anchor-key="autoscrollAnchorKey"
					>
						<!-- TODO(profile-scrunch) Might want to put
						a "back" button somewhere on the profile
						screen, just in case there are some nested
						routes that aren't being turned into modals.
						-->

						<template v-if="!Screen.isMobile" #default>
							<RouterLink
								:to="{
									name: 'profile.overview',
									params: { username: routeUser.username },
								}"
							>
								<h1 :style="headingStyles">
									{{ routeUser.display_name }}
									<span :style="headingUsernameStyles">
										@{{ routeUser.username }}
									</span>
								</h1>
							</RouterLink>
							<div>
								<!-- Joined on -->
								{{ $gettext(`Joined`) }}
								{{ ' ' }}
								<AppTimeAgo :date="routeUser.created_on" />

								<template v-if="isBootstrapped">
									<span class="dot-separator" />

									<AppProfileDogtags />
								</template>
							</div>
						</template>

						<template #spotlight>
							<AppPageHeaderAvatar
								v-if="!Screen.isMobile && !stickySides"
								class="anim-fade-in"
								:user="routeUser"
							/>
						</template>
					</AppPageHeader>
				</div>

				<RouterView />
			</AppUserBlockOverlay>
		</template>
	</div>
</template>
