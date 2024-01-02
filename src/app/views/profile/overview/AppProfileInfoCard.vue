<script lang="ts" setup>
import { CSSProperties, PropType, computed, toRef } from 'vue';
import { formatNumber } from '../../../../_common/filters/number';
import { Screen } from '../../../../_common/screen/screen-service';
import AppSpacer from '../../../../_common/spacer/AppSpacer.vue';
import { kThemeFg10 } from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { styleFlexCenter, styleLineClamp, styleWhen } from '../../../../_styles/mixins';
import { kFontSizeSmall, kFontSizeTiny, kStrongEaseOut } from '../../../../_styles/variables';
import { showCommentModal } from '../../../components/comment/modal/modal.service';
import { useProfileRouteStore } from '../RouteProfile.vue';
import { showProfileCommunitiesModal } from '../communities/modal.service';
import AppProfileDogtags from '../dogtags/AppProfileDogtags.vue';
import { showProfileFollowersModal } from '../followers/modal.service';
import { showProfileFollowingModal } from '../following/modal.service';
import AppProfileActionButtons from './AppProfileActionButtons.vue';
import AppProfileBio from './AppProfileBio.vue';
import AppProfileShortcutExtras from './shortcut/AppProfileShortcutExtras.vue';
import AppProfileShortcuts, { ProfileQuickLink } from './shortcut/AppProfileShortcuts.vue';
import AppProfileStat from './stats/AppProfileStat.vue';
import AppProfileStats, { ProfileStat } from './stats/AppProfileStats.vue';

defineProps({
	showAvatar: {
		type: Boolean,
	},
	fadeAvatar: {
		type: Boolean,
	},
	cardStyles: {
		type: Object as PropType<CSSProperties>,
		default: () => ({}),
	},
});

const {
	user: routeUser,
	isOverviewLoaded,
	canToggleDescription,
	showFullDescription,
	hasSales,
	gamesCount,
	previewTrophies,
	communitiesCount,
	floatingAvatarSize,
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
	if (!routeUser.value) {
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

	if (routeUser.value.shouts_enabled) {
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

	if (gamesCount.value > 0) {
		items.push({
			label: $gettext(`Games`),
			icon: 'gamepad',
			location: {
				name: 'library.collection.developer',
				params: { id: routeUser.value.username },
			},
		});
	}

	if (previewTrophies.value.length > 0) {
		items.push({
			label: $gettext(`Trophies`),
			icon: 'trophy',
			location: { name: 'profile.trophies' },
		});
	}

	if (communitiesCount.value > 0) {
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

const dividerStyles = {
	margin: `20px -20px`,
	height: `1px`,
	backgroundColor: kThemeFg10,
} satisfies CSSProperties;

const floatingInfoSpacerExpandedHeight = toRef(() => floatingAvatarSize.value * 0.6 + 12);
</script>

<template>
	<div v-if="routeUser">
		<!-- Floating info spacer -->
		<div
			:style="{
				...avatarExpandStyles,
				height: 0,
				...styleWhen(Screen.isDesktop && showAvatar, {
					height: `${floatingAvatarSize.value * 0.4}px`,
				}),
			}"
		/>

		<!-- Content/Card -->
		<div
			class="sheet"
			:style="{
				...cardStyles,
				...styleWhen(Screen.isMobile, {
					// Use the same background as the parent on mobile.
					backgroundColor: `inherit`,
					// Bleed the bottom padding since this no longer appears as a sheet.
					paddingBottom: 0,
				}),
			}"
		>
			<div
				v-if="Screen.isMobile && !routeUser.header_media_item"
				:style="{
					height: `${floatingAvatarSize.value + 80 - floatingInfoSpacerExpandedHeight}px`,
				}"
			/>
			<!-- Floating info (avatar, dogtags, names) -->
			<div
				:style="{
					...avatarExpandStyles,
					height: 0,
					...styleWhen(showAvatar, {
						height: Screen.isDesktop
							? `${floatingAvatarSize.value * 0.6 - 12}px`
							: `${floatingInfoSpacerExpandedHeight}px`,
					}),
				}"
			>
				<div
					:style="{
						minWidth: `100%`,
						height: `100%`,
						position: `relative`,
						...styleWhen(Screen.isMobile, {
							transition: `opacity 100ms linear, transform 100ms linear`,
							transform: `translateY(${fadeAvatar ? -50 : 0}%)`,
							opacity: fadeAvatar ? 0 : 1,
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
								bottom: 0,
								...styleWhen(Screen.isDesktop, {
									bottom: `24px`,
								}),
							}"
						>
							<AppUserAvatarBubble
								:style="{
									width: floatingAvatarSize.px,
								}"
								:user="routeUser"
								show-frame
								show-verified
								verified-size="big"
								:verified-offset="0"
								disable-link
								smoosh
							/>
							<div
								:style="{
									...styleFlexCenter({ direction: `column` }),
									position: `relative`,
									width: `100%`,
									paddingTop: `8px`,
								}"
							>
								<template v-if="Screen.isMobile">
									<div
										:style="{
											fontSize: kFontSizeSmall.px,
											fontWeight: `bold`,
											marginTop: `24px`,
											textAlign: `center`,
										}"
									>
										@{{ routeUser.username }}
									</div>
									<div
										v-app-tooltip.touchable="routeUser.display_name"
										:style="{
											fontSize: kFontSizeTiny.px,
											textAlign: `center`,
											...styleLineClamp(2),
										}"
									>
										{{ routeUser.display_name }}
									</div>
								</template>

								<AppProfileDogtags
									:style="{
										// Styled so that wrapped lines move the
										// top of this component instead of the bottom.
										position: `absolute`,
										bottom: `100%`,
										transform: `translateY(28px)`,
										zIndex: 2,
									}"
									wrap="wrap-reverse"
								/>
							</div>
						</div>
					</Transition>
				</div>
			</div>

			<!-- Stats -->
			<AppProfileStats :items="stats">
				<template #default="item">
					<AppProfileStat :item="item" />
				</template>
			</AppProfileStats>

			<div v-if="Screen.isDesktop" :style="dividerStyles" />
			<AppSpacer v-else vertical :scale="4" />

			<!-- Shortcuts -->
			<AppProfileShortcuts v-if="Screen.isDesktop" :items="quickLinks">
				<template #default="{ itemWidth }">
					<AppProfileShortcutExtras :width="itemWidth" />
				</template>
			</AppProfileShortcuts>
			<template v-else>
				<AppProfileActionButtons :quick-links="quickLinks" collapse />
			</template>

			<template v-if="Screen.isDesktop">
				<!-- Bio divider -->
				<div v-if="!isOverviewLoaded || routeUser.hasBio" :style="dividerStyles" />

				<!-- Bio -->
				<AppProfileBio
					v-model:can-toggle-description="canToggleDescription"
					v-model:show-full-description="showFullDescription"
				/>
			</template>
		</div>
	</div>
</template>
