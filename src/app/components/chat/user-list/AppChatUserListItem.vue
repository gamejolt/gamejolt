<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { useGridStore } from '../../grid/grid-store';
import { enterChatRoom, isUserOnline, leaveGroupRoom } from '../client';
import AppChatNotificationSettings from '../notification-settings/notification-settings.vue';
import { ChatRoom, getChatRoomTitle } from '../room';
import { ChatUser } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';
import AppChatListItem from '../_list/AppChatListItem.vue';

const props = defineProps({
	item: {
		type: Object as PropType<ChatUser | ChatRoom>,
		required: true,
	},
});

const { item } = toRefs(props);

const { chatUnsafe: chat } = useGridStore();

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

const title = computed(() =>
	item.value instanceof ChatUser ? item.value.display_name : getChatRoomTitle(item.value)
);

const meta = computed(() => (item.value instanceof ChatUser ? `@${item.value.username}` : null));

const hoverTitle = computed(() => {
	const parts = [title.value];
	if (meta.value) {
		parts.push(meta.value);
	}

	return parts.join(' ');
});

function onClick(e: Event) {
	enterChatRoom(chat.value, roomId.value);
	e.preventDefault();
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
	<AppChatListItem
		:title="hoverTitle"
		:horizontal-padding="16"
		:force-hover="isActive"
		popper-placement="bottom"
		popper-trigger="right-click"
		popper-hide-on-state-change
		@click="onClick"
	>
		<template #leading>
			<div class="-avatar">
				<img v-if="user" class="-avatar-img" :src="user.img_avatar" />
				<div v-else class="-avatar-icon">
					<AppJolticon icon="users" />
				</div>
			</div>
		</template>

		<template #leadingFloat>
			<AppChatUserOnlineStatus
				v-if="isOnline !== null"
				:is-online="isOnline"
				:size="12"
				:segment-width="1.5"
				background-color-base="bg"
			/>
		</template>

		<template #title>
			{{ title }}
			<span v-if="meta" class="tiny text-muted">{{ meta }}</span>
		</template>

		<template v-if="notificationsCount" #trailing>
			<span class="badge badge-overlay-notice">
				{{ formatNumber(notificationsCount) }}
			</span>
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
	</AppChatListItem>
</template>

<style lang="stylus" scoped>
.-avatar
.-avatar-img
.-avatar-icon
	width: 100%
	height: 100%

.-avatar-icon
	display: inline-flex
	align-items: center
	justify-content: center
	vertical-align: middle
	background-color: var(--theme-backlight)

	::v-deep(.jolticon)
		color: var(--theme-backlight-fg) !important
</style>
