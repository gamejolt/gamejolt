<script lang="ts" setup>
import { CSSProperties, computed } from 'vue';
import AppFadeCollapse from '../../../../_common/AppFadeCollapse.vue';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import { formatNumber } from '../../../../_common/filters/number';
import { Screen } from '../../../../_common/screen/screen-service';
import { kThemeFg10 } from '../../../../_common/theme/variables';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleFlexCenter, styleWhen } from '../../../../_styles/mixins';
import { kStrongEaseOut } from '../../../../_styles/variables';
import { showCommentModal } from '../../../components/comment/modal/modal.service';
import { useProfileRouteStore } from '../RouteProfile.vue';
import { showProfileCommunitiesModal } from '../communities/modal.service';
import AppProfileDogtags from '../dogtags/AppProfileDogtags.vue';
import { showProfileFollowersModal } from '../followers/modal/modal.service';
import { showProfileFollowingModal } from '../following/modal/modal.service';
import AppProfileActionButtons from './AppProfileActionButtons.vue';
import AppProfileShortcut from './shortcut/AppProfileShortcut.vue';
import AppProfileShortcutExtras from './shortcut/AppProfileShortcutExtras.vue';
import AppProfileShortcuts, { ProfileQuickLink } from './shortcut/AppProfileShortcuts.vue';
import AppProfileStat from './stats/AppProfileStat.vue';
import AppProfileStats, { ProfileStat } from './stats/AppProfileStats.vue';

defineProps({
	showAvatar: {
		type: Boolean,
	},
	avatarSize: {
		type: Number,
		default: 100,
		validator: val => typeof val === 'number' && val > 0,
	},
	fadeAvatar: {
		type: Boolean,
	},
});

const {
	user: routeUser,
	isOverviewLoaded,
	canToggleDescription,
	showFullDescription,
	hasSales,
	shouldShowShouts,
	hasGamesSection,
	shouldShowTrophies,
	hasCommunitiesSection,
} = useProfileRouteStore()!;

const stats = computed<ProfileStat[]>(() => {
	const user = routeUser.value;

	return [
		{
			label: $gettext('Following'),
			value: formatNumber(user?.following_count || 0),
			action: user
				? () => {
						showProfileFollowingModal({ user });
				  }
				: undefined,
			location: undefined,
		},
		{
			label: $gettext('Followers'),
			value: formatNumber(user?.follower_count || 0),
			action: user
				? () => {
						showProfileFollowersModal({ user });
				  }
				: undefined,
			location: undefined,
		},
		{
			label: $gettext('Likes'),
			value: formatNumber(user?.like_count || 0),
		},
	] satisfies ProfileStat[];
});

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
			action() {
				showProfileCommunitiesModal({
					user: routeUser.value!,
				});
			},
		});
	}

	return items;
});

const avatarExpandStyles = {
	transition: `height 600ms ${kStrongEaseOut}`,
} satisfies CSSProperties;
</script>

<template>
	<div v-if="routeUser">
		<!-- TODO(profile-scrunch) clean this up -->
		<div
			:style="{
				...avatarExpandStyles,
				height: showAvatar ? `${avatarSize * 0.4}px` : 0,
				...styleWhen(Screen.isMobile, {
					marginLeft: `-20px`,
					marginRight: `-20px`,
					maxHeight: 0,
				}),
			}"
		>
			<div
				:style="{
					minWidth: `100%`,
					position: `relative`,
					height: `${avatarSize * 0.4}px`,
					...styleWhen(Screen.isMobile, {
						transition: `opacity 100ms linear, transform 100ms linear`,
						transform: `translateY(${fadeAvatar ? -50 : 0}%)`,
						opacity: fadeAvatar ? 0 : 1,
					}),
					...styleWhen(Screen.isMobile, {
						height: 0,
					}),
					...styleWhen(!showAvatar, {
						pointerEvents: `none`,
					}),
				}"
			>
				<Transition>
					<div
						v-if="showAvatar"
						class="anim-fade-in-down anim-fade-leave-up"
						:style="{
							...styleFlexCenter({ direction: `column` }),
							position: `absolute`,
							width: `100%`,
							bottom: `${-avatarSize * 0.4}px`,
						}"
					>
						<AppUserAvatarBubble
							:user="routeUser"
							show-frame
							show-verified
							verified-size="big"
							:verified-offset="0"
							disable-link
							smoosh
							:style="{
								width: `${avatarSize}px`,
							}"
						/>
						<AppProfileDogtags
							:style="{
								// Styled so that wrapped lines move the
								// top of this component instead of the bottom.
								position: `absolute`,
								bottom: `-28px`,
								zIndex: 2,
							}"
							wrap="wrap-reverse"
						/>
					</div>
				</Transition>
			</div>
		</div>

		<div class="sheet">
			<!-- Avatar/Tags -->
			<div
				:style="{
					...avatarExpandStyles,
					height: showAvatar ? `${avatarSize * 0.6 + 20}px` : 0,
				}"
			/>

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
				<AppProfileActionButtons />
			</template>

			<!-- Bio divider -->
			<div
				v-if="!isOverviewLoaded || routeUser.bio_content"
				:style="{
					margin: `20px -20px`,
					height: `1px`,
					backgroundColor: kThemeFg10,
				}"
			/>

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

				<a
					v-if="canToggleDescription"
					class="hidden-text-expander"
					@click="showFullDescription = !showFullDescription"
				/>
			</template>
		</div>
	</div>
</template>
