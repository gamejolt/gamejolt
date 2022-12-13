<script lang="ts" setup>
// We want to make sure it doesn't actually have to import all these models to
// display.
import type { Comment } from '../../../../../_common/comment/comment-model';
import type { Community } from '../../../../../_common/community/community.model';
import type { FiresideCommunity } from '../../../../../_common/fireside/community/community.model';
import type { Fireside } from '../../../../../_common/fireside/fireside.model';
import type { FiresidePostCommunity } from '../../../../../_common/fireside/post/community/community.model';
import type { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import type { Mention } from '../../../../../_common/mention/mention.model';
import type { QuestNotification } from '../../../../../_common/quest/quest-notification-model';
import type { UserGameTrophy } from '../../../../../_common/user/trophy/game-trophy.model';
import type { UserSiteTrophy } from '../../../../../_common/user/trophy/site-trophy.model';

import { computed, PropType, ref, toRefs } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import AppFadeCollapse from '../../../../../_common/AppFadeCollapse.vue';
import '../../../../../_common/comment/comment.styl';
import AppCommunityThumbnailImg from '../../../../../_common/community/thumbnail/AppCommunityThumbnailImg.vue';
import {
	CommunityUserNotification,
	NotificationType,
} from '../../../../../_common/community/user-notification/user-notification.model';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import { Notification } from '../../../../../_common/notification/notification-model';
import { NotificationText } from '../../../../../_common/notification/notification-text.service';
import { SupporterAction } from '../../../../../_common/supporters/action.model';
import { AppTimeAgo } from '../../../../../_common/time/ago/ago';
import AppTimelineListItem from '../../../../../_common/timeline-list/item/item.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { BaseTrophy } from '../../../../../_common/trophy/base-trophy.model';
import AppUserCardHover from '../../../../../_common/user/card/AppUserCardHover.vue';
import { UserBaseTrophy } from '../../../../../_common/user/trophy/user-base-trophy.model';
import AppUserAvatar from '../../../../../_common/user/user-avatar/AppUserAvatar.vue';
import { User } from '../../../../../_common/user/user.model';
import { getTrophyImg } from '../../../trophy/thumbnail/thumbnail.vue';
import { ActivityFeedItem } from '../item-service';
import { useActivityFeed } from '../view';

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
const router = useRouter();

const canToggleContent = ref(false);

const notification = computed(() => item.value.feedItem as Notification);
const isNew = computed(() => feed.isItemUnread(item.value));
const isFromUser = computed(() => notification.value.from_model instanceof User);
const showTime = computed(() => notification.value.type !== Notification.TYPE_QUEST_NOTIFICATION);
const titleText = computed(() => NotificationText.getText(notification.value, false));

// Only show when there is a title text for the notification.
const shouldShow = computed(() => titleText.value !== undefined);

const hasDetails = computed(() => {
	const { type, action_model } = notification.value;

	if (type === Notification.TYPE_MENTION && (action_model as Mention).resource === 'Comment') {
		return true;
	}

	// Community user notifications with a post want to show the post lead.
	if (
		type === Notification.TYPE_COMMUNITY_USER_NOTIFICATION &&
		[NotificationType.POSTS_EJECT, NotificationType.POSTS_MOVE].includes(
			(action_model as CommunityUserNotification).type
		)
	) {
		return true;
	}

	if (type === Notification.TYPE_SUPPORTER_MESSAGE) {
		return !!(action_model as SupporterAction).message?.content;
	}

	return [
		Notification.TYPE_COMMENT_ADD,
		Notification.TYPE_COMMENT_ADD_OBJECT_OWNER,
		Notification.TYPE_POST_FEATURED_IN_COMMUNITY,
		Notification.TYPE_FIRESIDE_FEATURED_IN_COMMUNITY,
		Notification.TYPE_QUEST_NOTIFICATION,
		Notification.TYPE_GAME_TROPHY_ACHIEVED,
		Notification.TYPE_SITE_TROPHY_ACHIEVED,
	].includes(type);
});

const trophyImg = computed(() => {
	if (
		notification.value.action_model instanceof UserBaseTrophy &&
		notification.value.action_model.trophy instanceof BaseTrophy
	) {
		return getTrophyImg(notification.value.action_model.trophy);
	}
});

function go() {
	notification.value.$read();
	notification.value.go(router);
	emit('clicked');
}

function onMarkRead() {
	notification.value.$read();
}
</script>

<template>
	<div>
		<template v-if="shouldShow">
			<div class="notification-item">
				<div class="notification-container" @click.stop="go">
					<RouterLink :to="notification.routeLocation">
						<AppTimelineListItem :is-new="isNew">
							<template #bubble>
								<template
									v-if="
										notification.type ===
										Notification.TYPE_COMMUNITY_USER_NOTIFICATION
									"
								>
									<div class="-community-thumb">
										<AppCommunityThumbnailImg
											:community="(notification.from_model as Community)"
										/>
									</div>
								</template>
								<template v-else-if="isFromUser">
									<AppUserCardHover
										:user="(notification.from_model as User)"
										:disabled="!feed.shouldShowUserCards"
									>
										<AppUserAvatar :user="(notification.from_model as User)" />
									</AppUserCardHover>
								</template>
								<template
									v-else-if="
										notification.type ===
											Notification.TYPE_POST_FEATURED_IN_COMMUNITY ||
										notification.type ===
											Notification.TYPE_FIRESIDE_FEATURED_IN_COMMUNITY
									"
								>
									<div class="-community-thumb">
										<AppCommunityThumbnailImg
											:community="(notification.action_model as FiresidePostCommunity | FiresideCommunity).community"
										/>
									</div>
								</template>
								<template
									v-else-if="
										notification.type ===
											Notification.TYPE_GAME_TROPHY_ACHIEVED ||
										notification.type === Notification.TYPE_SITE_TROPHY_ACHIEVED
									"
								>
									<img class="img-circle -trophy-img" :src="trophyImg" />
								</template>
								<template
									v-else-if="
										notification.type === Notification.TYPE_QUEST_NOTIFICATION
									"
								>
									<div class="-avatar-icon">
										<AppJolticon icon="quest-log" />
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
															Notification.TYPE_COMMENT_ADD ||
														notification.type ===
															Notification.TYPE_COMMENT_ADD_OBJECT_OWNER
													"
													:source="
														(notification.action_model as Comment).comment_content
													"
												/>
												<AppContentViewer
													v-else-if="
														notification.type ===
														Notification.TYPE_MENTION
													"
													:source="
														(notification.action_model as Mention).comment
															?.comment_content
													"
												/>
												<AppContentViewer
													v-else-if="
														notification.type ===
														Notification.TYPE_SUPPORTER_MESSAGE
													"
													:source="
														(notification.action_model as SupporterAction).message?.content
													"
												/>
												<span
													v-else-if="
														notification.type ===
														Notification.TYPE_POST_FEATURED_IN_COMMUNITY
													"
												>
													{{
														(notification.action_model as FiresidePostCommunity).fireside_post?.getShortLead()
													}}
												</span>
												<span
													v-else-if="
														notification.type ===
														Notification.TYPE_FIRESIDE_FEATURED_IN_COMMUNITY
													"
												>
													{{ (notification.to_model as Fireside).title }}
												</span>
												<span
													v-else-if="
														notification.type ===
														Notification.TYPE_COMMUNITY_USER_NOTIFICATION
													"
												>
													{{ (notification.to_model as FiresidePost).getShortLead() }}
												</span>
												<span
													v-else-if="
														notification.type ===
															Notification.TYPE_GAME_TROPHY_ACHIEVED ||
														notification.type ===
															Notification.TYPE_SITE_TROPHY_ACHIEVED
													"
												>
													{{
														(notification.action_model as UserGameTrophy | UserSiteTrophy).trophy?.description
													}}
												</span>
												<span
													v-else-if="
														notification.type ===
														Notification.TYPE_QUEST_NOTIFICATION
													"
													class="tiny text-muted"
												>
													{{ (notification.action_model as QuestNotification).subtitle }}
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
