<script lang="ts" setup>
// We want to make sure it doesn't actually have to import all these models to
// display.
import '~common/comment/comment.styl';

import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { ActivityFeedItem } from '~app/components/activity/feed/item-service';
import {
	getNotificationRouteLocation,
	gotoNotification,
} from '~app/components/activity/feed/notification/notification-routing';
import { useActivityFeed } from '~app/components/activity/feed/view';
import { useAppStore } from '~app/store/index';
import AppFadeCollapse from '~common/AppFadeCollapse.vue';
import { AvatarFrameModel } from '~common/avatar/frame.model';
import type { CommentModel } from '~common/comment/comment-model';
import type { CommunityModel } from '~common/community/community.model';
import AppCommunityThumbnailImg from '~common/community/thumbnail/AppCommunityThumbnailImg.vue';
import {
	CommunityUserNotificationModel,
	CommunityUserNotificationType,
} from '~common/community/user-notification/user-notification.model';
import AppContentViewer from '~common/content/content-viewer/AppContentViewer.vue';
import { CreatorExperienceLevelModel } from '~common/creator/experience/level.model';
import type { FiresidePostCommunityModel } from '~common/fireside/post/community/community.model';
import type { FiresidePostModel } from '~common/fireside/post/post-model';
import { InventoryShopGiftModel } from '~common/inventory/shop/inventory-shop-gift.model';
import { getReadablePurchasableProductType } from '~common/inventory/shop/product-owner-helpers';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import type { MentionModel } from '~common/mention/mention.model';
import {
	$readNotification,
	NotificationModel,
	NotificationType,
} from '~common/notification/notification-model';
import { NotificationText } from '~common/notification/notification-text.service';
import type { QuestNotificationModel } from '~common/quest/quest-notification-model';
import { SupporterActionModel } from '~common/supporters/action.model';
import { kThemeFgMuted } from '~common/theme/variables';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import AppTimelineListItem from '~common/timeline-list/item/AppTimelineListItem.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { BaseTrophyModel } from '~common/trophy/base-trophy.model';
import { getTrophyImg } from '~common/trophy/thumbnail/AppTrophyThumbnail.vue';
import AppUserCardHover from '~common/user/card/AppUserCardHover.vue';
import type { UserGameTrophyModel } from '~common/user/trophy/game-trophy.model';
import type { UserSiteTrophyModel } from '~common/user/trophy/site-trophy.model';
import { UserBaseTrophyModel } from '~common/user/trophy/user-base-trophy.model';
import { UserModel } from '~common/user/user.model';
import AppUserAvatar from '~common/user/user-avatar/AppUserAvatar.vue';
import { UserAvatarFrameModel } from '~common/user/user-avatar/frame/frame.model';
import { isInstance } from '~utils/utils';

type Props = {
	item: ActivityFeedItem;
};
const { item } = defineProps<Props>();

const emit = defineEmits<{
	clicked: [];
}>();
const feed = useActivityFeed()!;
const appStore = useAppStore();

const canToggleContent = ref(false);

const notification = computed(() => item.feedItem as NotificationModel);
const isNew = computed(() => feed.isItemUnread(item));
const showUserAvatar = computed(() => {
	if (notification.value.type === NotificationType.ShopGiftReceived) {
		return false;
	}
	return notification.value.from_model instanceof UserModel;
});
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
		NotificationType.ShopGiftReceived,
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
	gotoNotification(notification.value, { appStore });
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
											:community="notification.from_model as CommunityModel"
										/>
									</div>
								</template>
								<template v-else-if="showUserAvatar">
									<AppUserCardHover
										:user="notification.from_model as UserModel"
										:disabled="!feed.shouldShowUserCards"
									>
										<AppUserAvatar
											:user="notification.from_model as UserModel"
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
											:community="
												(
													notification.action_model as FiresidePostCommunityModel
												).community
											"
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
								<template
									v-else-if="
										notification.type === NotificationType.ShopGiftReceived
									"
								>
									<div class="-avatar-icon">
										<AppJolticon icon="gift" />
									</div>
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
														(notification.action_model as CommentModel)
															.comment_content
													"
												/>
												<AppContentViewer
													v-else-if="
														notification.type ===
														NotificationType.Mention
													"
													:source="
														(notification.action_model as MentionModel)
															.comment?.comment_content || ''
													"
												/>
												<AppContentViewer
													v-else-if="
														notification.type ===
														NotificationType.SupporterMessage
													"
													:source="
														(
															notification.action_model as SupporterActionModel
														).message?.content || ''
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
												<span
													v-else-if="
														notification.type ===
															NotificationType.ShopGiftReceived &&
														isInstance(
															notification.action_model,
															InventoryShopGiftModel
														)
													"
													:style="{
														fontStyle: `italic`,
														color: kThemeFgMuted,
													}"
												>
													{{
														getReadablePurchasableProductType(
															notification.action_model.product_type
														) +
														(notification.action_model.product
															? `: ${notification.action_model.product.name}`
															: ``)
													}}
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
