<script lang="ts" setup>
// We want to make sure it doesn't actually have to import all these models to
// display.
import type { CommentModel } from '../../../../../_common/comment/comment-model';
import type { CommunityModel } from '../../../../../_common/community/community.model';
import type { FiresidePostCommunityModel } from '../../../../../_common/fireside/post/community/community.model';
import type { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import type { MentionModel } from '../../../../../_common/mention/mention.model';
import type { QuestNotificationModel } from '../../../../../_common/quest/quest-notification-model';
import type { UserGameTrophyModel } from '../../../../../_common/user/trophy/game-trophy.model';
import type { UserSiteTrophyModel } from '../../../../../_common/user/trophy/site-trophy.model';

import { computed, PropType, ref, toRefs } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import AppFadeCollapse from '../../../../../_common/AppFadeCollapse.vue';
import { AvatarFrameModel } from '../../../../../_common/avatar/frame.model';
import '../../../../../_common/comment/comment.styl';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import {
	CommunityUserNotificationModel,
	CommunityUserNotificationType,
} from '../../../../../_common/community/user-notification/user-notification.model';
import AppContentViewer from '../../../../../_common/content/content-viewer/AppContentViewer.vue';
import { CreatorExperienceLevelModel } from '../../../../../_common/creator/experience/level.model';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import {
	$readNotification,
	NotificationModel,
	NotificationType,
} from '../../../../../_common/notification/notification-model';
import { NotificationText } from '../../../../../_common/notification/notification-text.service';
import { SupporterActionModel } from '../../../../../_common/supporters/action.model';
import AppTimeAgo from '../../../../../_common/time/AppTimeAgo.vue';
import AppTimelineListItem from '../../../../../_common/timeline-list/item/AppTimelineListItem.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { BaseTrophyModel } from '../../../../../_common/trophy/base-trophy.model';
import { getTrophyImg } from '../../../../../_common/trophy/thumbnail/AppTrophyThumbnail.vue';
import AppUserCardHover from '../../../../../_common/user/card/AppUserCardHover.vue';
import { UserBaseTrophyModel } from '../../../../../_common/user/trophy/user-base-trophy.model';
import AppUserAvatar from '../../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { UserAvatarFrameModel } from '../../../../../_common/user/user-avatar/frame/frame.model';
import { UserModel } from '../../../../../_common/user/user.model';
import { useAppStore } from '../../../../store/index';
import { ActivityFeedItem } from '../item-service';
import { useActivityFeed } from '../view';
import { getNotificationRouteLocation, gotoNotification } from './notification-routing';

const props = defineProps({
	item: {
		type: Object as PropType<ActivityFeedItem>,
		required: true,
	},
});

const emit = defineEmits({
	clicked: () => true,
});

const { item } = toRefs(props);
const feed = useActivityFeed()!;
const appStore = useAppStore();
const router = useRouter();

const canToggleContent = ref(false);

const notification = computed(() => item.value.feedItem as NotificationModel);
const isNew = computed(() => feed.isItemUnread(item.value));
const isFromUser = computed(() => notification.value.from_model instanceof UserModel);
const showTime = computed(() => notification.value.type !== NotificationType.QuestNotification);
const titleText = computed(() => NotificationText.getText(notification.value, false));

// Only show when there is a title text for the notification.
const shouldShow = computed(() => titleText.value !== undefined);

const notificationLocation = computed(() => getNotificationRouteLocation(notification.value));

const hasDetails = computed(() => {
	const { type, action_model } = notification.value;

	if (
		type === NotificationType.Mention &&
		(action_model as MentionModel).resource === 'Comment'
	) {
		return true;
	}

	// Community user notifications with a post want to show the post lead.
	if (
		type === NotificationType.CommunityUserNotification &&
		[
			CommunityUserNotificationType.POSTS_EJECT,
			CommunityUserNotificationType.POSTS_MOVE,
		].includes((action_model as CommunityUserNotificationModel).type)
	) {
		return true;
	}

	if (type === NotificationType.SupporterMessage) {
		return !!(action_model as SupporterActionModel).message?.content;
	}

	return [
		NotificationType.CommentAdd,
		NotificationType.CommentAddObjectOwner,
		NotificationType.PostFeaturedInCommunity,
		NotificationType.QuestNotification,
		NotificationType.GameTrophyAchieved,
		NotificationType.SiteTrophyAchieved,
		NotificationType.PollEnded,
		NotificationType.CreatorLevelUp,
		NotificationType.UnlockedAvatarFrame,
	].includes(type);
});

const trophyImg = computed(() => {
	if (
		notification.value.action_model instanceof UserBaseTrophyModel &&
		notification.value.action_model.trophy instanceof BaseTrophyModel
	) {
		return getTrophyImg(notification.value.action_model.trophy);
	}
});

const avatarFrameImg = computed(() => {
	if (
		notification.value.action_model instanceof UserAvatarFrameModel &&
		notification.value.action_model.avatar_frame instanceof AvatarFrameModel
	) {
		return notification.value.action_model.avatar_frame.image_url;
	}
});

function go() {
	$readNotification(notification.value);
	gotoNotification(notification.value, { router, appStore });
	emit('clicked');
}

function onMarkRead() {
	$readNotification(notification.value);
}
</script>

<template>
	<div>
		<template v-if="shouldShow">
			<div class="notification-item">
				<div class="notification-container" @click.stop="go">
					<RouterLink :to="notificationLocation">
						<AppTimelineListItem :is-new="isNew">
							<template #bubble>
								<template
									v-if="
										notification.type ===
										NotificationType.CommunityUserNotification
									"
								>
									<div class="-community-thumb">
										<AppCommunityThumbnailImg
											:community="(notification.from_model as CommunityModel)"
										/>
									</div>
								</template>
								<template v-else-if="isFromUser">
									<AppUserCardHover
										:user="(notification.from_model as UserModel)"
										:disabled="!feed.shouldShowUserCards"
									>
										<AppUserAvatar
											:user="(notification.from_model as UserModel)"
										/>
									</AppUserCardHover>
								</template>
								<template
									v-else-if="
										notification.type ===
										NotificationType.PostFeaturedInCommunity
									"
								>
									<div class="-community-thumb">
										<AppCommunityThumbnailImg
											:community="(notification.action_model as FiresidePostCommunityModel).community"
										/>
									</div>
								</template>
								<template
									v-else-if="
										notification.type === NotificationType.GameTrophyAchieved ||
										notification.type === NotificationType.SiteTrophyAchieved
									"
								>
									<img class="img-circle -trophy-img" :src="trophyImg" />
								</template>
								<template
									v-else-if="
										notification.type === NotificationType.QuestNotification
									"
								>
									<div class="-avatar-icon">
										<AppJolticon icon="quest-log" />
									</div>
								</template>
								<template
									v-else-if="notification.type === NotificationType.PollEnded"
								>
									<div class="-avatar-icon">
										<AppJolticon icon="pedestals-numbers" />
									</div>
								</template>
								<template
									v-else-if="
										notification.type === NotificationType.CreatorLevelUp &&
										notification.action_model instanceof
											CreatorExperienceLevelModel
									"
								>
									<div class="-avatar-icon">
										<AppJolticon icon="sparkles" />
									</div>
								</template>
								<template
									v-else-if="
										notification.type === NotificationType.UnlockedAvatarFrame
									"
								>
									<img class="img-circle -trophy-img" :src="avatarFrameImg" />
								</template>
							</template>

							<div class="-container">
								<div class="-main">
									<div
										class="timeline-list-item-title timeline-list-item-title-small"
										v-html="titleText"
									/>

									<div v-if="showTime" class="timeline-list-item-meta">
										<AppTimeAgo :date="notification.added_on" />
									</div>

									<div v-if="hasDetails" class="timeline-list-item-details">
										<div class="timeline-list-item-content">
											<AppFadeCollapse
												:collapse-height="160"
												:is-open="false"
												@require-change="canToggleContent = $event"
											>
												<AppContentViewer
													v-if="
														notification.type ===
															NotificationType.CommentAdd ||
														notification.type ===
															NotificationType.CommentAddObjectOwner
													"
													:source="
														(notification.action_model as CommentModel).comment_content
													"
												/>
												<AppContentViewer
													v-else-if="
														notification.type ===
														NotificationType.Mention
													"
													:source="
														(notification.action_model as MentionModel).comment
															?.comment_content
													"
												/>
												<AppContentViewer
													v-else-if="
														notification.type ===
														NotificationType.SupporterMessage
													"
													:source="
														(notification.action_model as SupporterActionModel).message?.content
													"
												/>
												<span
													v-else-if="
														notification.type ===
														NotificationType.PollEnded
													"
												>
													{{
														(
															notification.from_model as FiresidePostModel
														).getShortLead()
													}}
												</span>
												<span
													v-else-if="
														notification.type ===
														NotificationType.PostFeaturedInCommunity
													"
												>
													{{
														(
															notification.action_model as FiresidePostCommunityModel
														).fireside_post?.getShortLead()
													}}
												</span>
												<span
													v-else-if="
														notification.type ===
														NotificationType.CommunityUserNotification
													"
												>
													{{
														(
															notification.to_model as FiresidePostModel
														).getShortLead()
													}}
												</span>
												<span
													v-else-if="
														notification.type ===
															NotificationType.GameTrophyAchieved ||
														notification.type ===
															NotificationType.SiteTrophyAchieved
													"
												>
													{{
														(
															notification.action_model as
																| UserGameTrophyModel
																| UserSiteTrophyModel
														).trophy?.description
													}}
												</span>
												<span
													v-else-if="
														notification.type ===
														NotificationType.QuestNotification
													"
													class="tiny text-muted"
												>
													{{
														(
															notification.action_model as QuestNotificationModel
														).subtitle
													}}
												</span>
												<span
													v-else-if="
														notification.type ===
															NotificationType.CreatorLevelUp &&
														notification.action_model instanceof
															CreatorExperienceLevelModel &&
														notification.action_model.ability !== null
													"
												>
													{{
														$gettext(
															`Click to see the ability you've unlocked.`
														)
													}}
												</span>
												<span
													v-else-if="
														notification.type ===
														NotificationType.UnlockedAvatarFrame
													"
												>
													{{ $gettext(`Click to equip!`) }}
												</span>
											</AppFadeCollapse>
										</div>
									</div>
								</div>
							</div>

							<div class="-overlay" />
						</AppTimelineListItem>
					</RouterLink>
				</div>
				<div v-if="isNew" class="-actions">
					<a @click.stop.prevent="onMarkRead">
						<AppJolticon v-app-tooltip="$gettext(`Mark as Read`)" icon="radio-circle" />
					</a>
				</div>
			</div>

			<div class="timeline-list-item-split" />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.notification-item
	display: flex

.notification-container
	flex-grow: 1
	position: relative
	max-width: 100%

.-container
	display: flex

.-main
	flex: auto
	max-width: 100%
	padding-right: 10px

.-actions
	margin-left: 10px

// This overlay will capture all clicks.
// This prevents other links within the element to activate, and also prevents opening hover targets, like poppers.
// Due to the @click.stop on the main container, the clicks to this will navigate.
.-overlay
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0

.-community-thumb
	position: absolute
	width: 100%
	height: 100%
	top: 0
	left: 0

.-trophy-img
	display: block
	width: 100%
	height: 100%

.-avatar-icon
	position: absolute
	width: 100%
	height: 100%
	top: 0
	left: 0
	display: flex
	justify-content: center
	align-items: center

	.jolticon
		margin: 0
		padding: 0
		font-size: 24px
</style>
