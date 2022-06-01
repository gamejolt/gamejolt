<script lang="ts">
import { computed, PropType, ref, toRefs } from 'vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../_common/popper/popper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { useChatStore } from '../chat-store';
import { enterChatRoom, isUserOnline, leaveGroupRoom } from '../client';
import AppChatNotificationSettings from '../notification-settings/notification-settings.vue';
import { ChatRoom, getChatRoomTitle } from '../room';
import { ChatUser } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';
import AppChatListItem from '../_list/AppChatListItem.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });
</script>

<script lang="ts" setup>
const props = defineProps({
	item: {
		type: Object as PropType<ChatUser | ChatRoom>,
		required: true,
	},
});

const { item } = toRefs(props);

const chatStore = useChatStore()!;

const isInview = ref(false);
const isHovered = ref(false);

const chat = computed(() => chatStore.chat!);

const roomId = computed(() =>
	item.value instanceof ChatUser ? item.value.room_id : item.value.id
);

const user = computed(() => (item.value instanceof ChatUser ? item.value : null));

const isActive = computed(() => chat.value.room?.id === roomId.value);

const notificationsCount = computed(() => chat.value.notifications[roomId.value] ?? 0);

const isOnline = computed(() => {
	if (!chat.value || !user.value) {
		return null;
	}

	return isUserOnline(chat.value, item.value.id);
});

const title = computed(() => {
	return item.value instanceof ChatUser
		? item.value.display_name
		: getChatRoomTitle(item.value, chat.value);
});

const meta = computed(() => {
	return item.value instanceof ChatUser ? `@${item.value.username}` : null;
});

const hoverTitle = computed(() => {
	const parts = [title.value];
	if (meta.value) {
		parts.push(meta.value);
	}

	return parts.join(' ');
});

const componentEvents = computed(() => {
	const events: Record<string, any> = {
		click: onClick,
	};

	// Only group chats have an action we need to show on hover.
	if (!user.value) {
		events.mouseenter = onMouseEnter;
		events.mouseleave = onMouseLeave;
	}

	return events;
});

function onClick(e: Event) {
	enterChatRoom(chat.value, roomId.value);
	e.preventDefault();
}

function onMouseEnter() {
	isHovered.value = true;
}

function onMouseLeave() {
	isHovered.value = false;
}

/**
 * Only for group chats.
 */
async function leaveRoom() {
	if (!(item.value instanceof ChatRoom)) {
		return;
	}

	const result = await ModalConfirm.show(
		$gettext(`Are you sure you want to leave the group chat?`)
	);

	if (!result) {
		return;
	}

	leaveGroupRoom(chat.value, item.value);
}
</script>

<template>
	<AppScrollInview
		class="-container"
		:config="InviewConfig"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<AppPopper
			v-if="isInview"
			popover-class="fill-darkest"
			trigger="right-click"
			placement="bottom"
			block
			fixed
			hide-on-state-change
		>
			<template #default>
				<AppChatListItem
					:title="hoverTitle"
					:horizontal-padding="16"
					:force-hover="isActive"
					v-on="componentEvents"
				>
					<template #leading>
						<img v-if="user" :src="user.img_avatar" />
						<div v-else class="-group-icon">
							<AppJolticon icon="users" />
						</div>
					</template>

					<template #leadingFloat>
						<AppChatUserOnlineStatus
							v-if="isOnline !== null"
							:is-online="isOnline"
							:size="12"
							:absolute="false"
							background-color-base="bg"
						/>
					</template>

					<template #title>
						{{ title }}
						<span v-if="meta" class="tiny text-muted">{{ meta }}</span>
					</template>

					<template #trailing>
						<span v-if="notificationsCount" class="tag tag-highlight notifications-tag">
							{{ formatNumber(notificationsCount) }}
						</span>
					</template>
				</AppChatListItem>
			</template>

			<template #popover>
				<div class="fill-darker">
					<div class="list-group list-group-dark">
						<AppChatNotificationSettings :room-id="roomId" :is-pm-room="!!user" />

						<template v-if="!user">
							<hr />
							<a class="list-group-item has-icon" @click="leaveRoom">
								<AppJolticon icon="logout" notice />
								<AppTranslate>Leave Room</AppTranslate>
							</a>
						</template>
					</div>
				</div>
			</template>
		</AppPopper>
	</AppScrollInview>
</template>

<style lang="stylus" scoped>
.-group-icon
	width: 100%
	height: 100%
	display: inline-flex
	align-items: center
	justify-content: center
	vertical-align: middle
	background-color: var(--theme-backlight)

	::v-deep(.jolticon)
		color: var(--theme-backlight-fg) !important
</style>
