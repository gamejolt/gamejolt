<script lang="ts">
import { inject, InjectionKey, provide, ref } from 'vue';
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import { BlockModal } from '../../../_common/block/modal/modal.service';
import { CommentModal } from '../../../_common/comment/modal/modal.service';
import { Environment } from '../../../_common/environment/environment.service';
import { formatNumber } from '../../../_common/filters/number';
import AppPopper from '../../../_common/popper/AppPopper.vue';
import { Registry } from '../../../_common/registry/registry.service';
import { ReportModal } from '../../../_common/report/modal/modal.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../_common/route/route-component';
import { Screen } from '../../../_common/screen/screen-service';
import { copyShareLink } from '../../../_common/share/share.service';
import { useCommonStore } from '../../../_common/store/common-store';
import { useThemeStore } from '../../../_common/theme/theme.store';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../_common/translate/translate.service';
import AppUserFollowWidget from '../../../_common/user/follow/widget.vue';
import { UserFriendship } from '../../../_common/user/friendship/friendship.model';
import { populateTrophies } from '../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophy } from '../../../_common/user/trophy/user-base-trophy.model';
import AppUserAvatar from '../../../_common/user/user-avatar/AppUserAvatar.vue';
import { User } from '../../../_common/user/user.model';
import AppUserVerifiedTick from '../../../_common/user/verified-tick/AppUserVerifiedTick.vue';
import { isUserOnline } from '../../components/chat/client';
import { useGridStore } from '../../components/grid/grid-store';
import { IntentService } from '../../components/intent/intent.service';
import AppPageHeaderControls from '../../components/page-header/controls/controls.vue';
import AppPageHeader from '../../components/page-header/page-header.vue';
import AppUserDogtag from '../../components/user/AppUserDogtag.vue';
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

@Options({
	name: 'RouteProfile',
	components: {
		AppPageHeader,
		AppPageHeaderControls,
		AppTimeAgo,
		AppUserAvatar,
		AppUserDogtag,
		AppPopper,
		AppUserFollowWidget,
		AppUserVerifiedTick,
		AppUserBlockOverlay,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
@OptionsForRoute({
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
export default class RouteProfile extends BaseRouteComponent {
	routeStore = setup(() => {
		const c = createController();
		provide(Key, c);
		return c;
	});

	commonStore = setup(() => useCommonStore());
	themeStore = setup(() => useThemeStore());
	gridStore = setup(() => useGridStore());

	readonly UserFriendship = UserFriendship;
	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

	get app() {
		return this.commonStore;
	}

	get user() {
		return this.routeStore.user;
	}

	get trophyCount() {
		return this.routeStore.trophyCount;
	}

	get userFriendship() {
		return this.routeStore.userFriendship;
	}

	get chat() {
		return this.gridStore.chat;
	}

	/**
	 * The cover height changes when we switch to not showing the full cover, so
	 * let's make sure we reset the autoscroll anchor so that it scrolls to the
	 * top again.
	 */
	get autoscrollAnchorKey() {
		return this.user!.id;
	}

	get commentsCount() {
		if (this.user && this.user.comment_count) {
			return this.user.comment_count;
		}
		return 0;
	}

	get canBlock() {
		return (
			this.user && !this.user.is_blocked && this.app.user && this.user.id !== this.app.user.id
		);
	}

	get shouldShowFollow() {
		return (
			this.app.user &&
			this.user &&
			this.app.user.id !== this.user.id &&
			!this.user.is_blocked &&
			!this.user.blocked_you
		);
	}

	get shouldShowEdit() {
		return this.app.user && this.user && this.app.user.id === this.user.id;
	}

	get isOnline(): null | boolean {
		if (!this.chat || !this.user) {
			return null;
		}

		return isUserOnline(this.chat, this.user.id);
	}

	routeCreated() {
		// This isn't needed by SSR or anything, so it's fine to call it here.
		this.routeStore.bootstrapUser(this.$route.params.username.toString());
		this.setPageTheme();
	}

	routeResolved(payload: any) {
		this.routeStore.profilePayload(payload);
		this.setPageTheme();
	}

	routeDestroyed() {
		this.themeStore.clearPageTheme(ProfileThemeKey);
	}

	private setPageTheme() {
		const theme = this.user?.theme ?? null;
		this.themeStore.setPageTheme({
			key: ProfileThemeKey,
			theme,
		});
	}

	showComments() {
		if (this.user) {
			CommentModal.show({
				model: this.user,
				displayMode: 'shouts',
			});
		}
	}

	copyShareUrl() {
		if (!this.user) {
			return;
		}
		const url = Environment.baseUrl + this.user.url;
		copyShareLink(url, 'user');
	}

	report() {
		if (this.user) {
			ReportModal.show(this.user);
		}
	}

	async blockUser() {
		if (this.user) {
			const result = await BlockModal.show(this.user);

			// Navigate away from the page after blocking.
			if (result) {
				this.$router.push({
					name: 'dash.account.blocks',
				});
			}
		}
	}
}
</script>

<template>
	<div v-if="user">
		<!--
			If this user is banned, we show very little.
		-->
		<template v-if="!user.status">
			<AppPageHeader>
				<h1 class="-heading">
					{{ user.display_name }}
					<small class="-heading-username">@{{ user.username }}</small>
				</h1>

				<div class="text-muted small">
					<AppTranslate>Joined</AppTranslate>
					{{ ' ' }}
					<AppTimeAgo :date="user.created_on" />
				</div>
			</AppPageHeader>

			<router-view />
		</template>
		<template v-else>
			<AppUserBlockOverlay :user="user">
				<AppPageHeader
					:cover-media-item="user.header_media_item"
					:cover-max-height="400"
					should-affix-nav
					:autoscroll-anchor-key="autoscrollAnchorKey"
				>
					<router-link
						:to="{
							name: 'profile.overview',
							params: { username: user.username },
						}"
					>
						<h1 class="-heading">
							{{ user.display_name }}
							<AppUserVerifiedTick :user="user" big />
							<span class="-heading-username">@{{ user.username }}</span>
						</h1>
					</router-link>
					<div>
						<!-- Joined on -->
						<AppTranslate>Joined</AppTranslate>
						{{ ' ' }}
						<AppTimeAgo :date="user.created_on" />

						<template v-if="isRouteBootstrapped">
							<span class="dot-separator" />

							<!-- Dogtags -->
							<AppUserDogtag v-for="tag of user.dogtags" :key="tag.text" :tag="tag" />

							<!-- Friend status -->
							<span
								v-if="
									userFriendship &&
									userFriendship.state === UserFriendship.STATE_FRIENDS
								"
								v-app-tooltip="$gettext('You are friends! Awwww!')"
								class="tag tag-highlight"
							>
								<AppTranslate>Friend</AppTranslate>
							</span>

							<!-- Online status -->
							<template v-if="isOnline !== null">
								<span
									v-if="isOnline === false"
									v-app-tooltip="$gettext('This user is currently offline.')"
									class="tag"
								>
									<AppTranslate>Offline</AppTranslate>
								</span>
								<span
									v-else
									v-app-tooltip="$gettext('This user is currently online.')"
									class="tag tag-highlight"
								>
									<AppTranslate>Online</AppTranslate>
								</span>
							</template>

							<!-- Following status -->
							<span
								v-if="user.follows_you"
								v-app-tooltip="$gettext('This user is following you.')"
								class="tag tag-highlight"
							>
								<AppTranslate>Follows You</AppTranslate>
							</span>
						</template>
					</div>

					<template #spotlight>
						<AppUserAvatar :user="user" />
					</template>

					<template #nav>
						<nav class="platform-list inline">
							<ul>
								<li>
									<router-link
										:to="{ name: 'profile.overview' }"
										:class="{ active: $route.name === 'profile.overview' }"
									>
										<AppTranslate>Profile</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'profile.following' }"
										active-class="active"
									>
										<AppTranslate>Following</AppTranslate>
										<span class="badge">
											{{ formatNumber(user.following_count) }}
										</span>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'profile.followers' }"
										active-class="active"
									>
										<AppTranslate>Followers</AppTranslate>
										<span class="badge">
											{{ formatNumber(user.follower_count) }}
										</span>
									</router-link>
								</li>
								<!--
									We only need to show this on mobile.
								-->
								<li v-if="user.shouts_enabled && Screen.isMobile">
									<a @click="showComments()">
										<AppTranslate>Shouts</AppTranslate>
										<span class="badge">
											{{ formatNumber(commentsCount) }}
										</span>
									</a>
								</li>
								<li>
									<router-link
										:to="{ name: 'profile.library' }"
										active-class="active"
									>
										<AppTranslate>Library</AppTranslate>
									</router-link>
								</li>
								<li>
									<router-link
										:to="{ name: 'profile.trophies' }"
										active-class="active"
									>
										<AppTranslate>Trophies</AppTranslate>
										<span class="badge">
											{{ formatNumber(trophyCount) }}
										</span>
									</router-link>
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
													<AppTranslate>Copy link to user</AppTranslate>
												</a>
												<a
													v-if="app.user && user.id !== app.user.id"
													class="list-group-item has-icon"
													@click="report"
												>
													<AppJolticon icon="flag" />
													<AppTranslate> Report user </AppTranslate>
												</a>
												<a
													v-if="
														userFriendship &&
														userFriendship.state ===
															UserFriendship.STATE_FRIENDS
													"
													class="list-group-item has-icon"
													@click="routeStore.removeFriend()"
												>
													<AppJolticon icon="friend-remove-1" notice />
													<AppTranslate> Remove Friend </AppTranslate>
												</a>
												<a
													v-if="canBlock"
													class="list-group-item has-icon"
													@click="blockUser"
												>
													<AppJolticon icon="friend-remove-2" notice />
													<AppTranslate>Block user</AppTranslate>
												</a>
												<a
													v-if="app.user && app.user.permission_level > 0"
													class="list-group-item has-icon"
													:href="`${Environment.baseUrl}/moderate/users/view/${user.id}`"
													target="_blank"
												>
													<AppJolticon icon="cog" />
													<AppTranslate> Moderate User </AppTranslate>
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
							<AppUserFollowWidget
								v-if="shouldShowFollow"
								:user="user"
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
								<AppTranslate>Edit Profile</AppTranslate>
							</AppButton>
						</AppPageHeaderControls>
					</template>
				</AppPageHeader>

				<router-view />
			</AppUserBlockOverlay>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.-heading
	margin-bottom: 4px
	display: flex
	align-items: center

.-heading-username
	font-size: 19px
	font-family: $font-family-base
	font-weight: 700
	margin-left: 8px
</style>
