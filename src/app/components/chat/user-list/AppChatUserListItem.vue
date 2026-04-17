<script lang="ts" setup>
import { computed } from 'vue';

import AppChatListItem from '~app/components/chat/_list/AppChatListItem.vue';
import { isUserOnline, leaveGroupRoom, openChatRoom } from '~app/components/chat/client';
import AppChatNotificationSettings from '~app/components/chat/notification-settings/AppChatNotificationSettings.vue';
import { ChatRoomModel, getChatRoomTitle } from '~app/components/chat/room';
import { ChatUser } from '~app/components/chat/user';
import AppChatUserOnlineStatus from '~app/components/chat/user-online-status/AppChatUserOnlineStatus.vue';
import { useGridStore } from '~app/components/grid/grid-store';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '~common/modal/confirm/confirm-service';
import AppNotificationBlip from '~common/notification/AppNotificationBlip.vue';
import { kThemeBacklight, kThemeBacklightFg } from '~common/theme/variables';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';

type Props = {
	item: ChatUser | ChatRoomModel;
};
const { item } = defineProps<Props>();

const { chatUnsafe: chat } = useGridStore();

const roomId = computed(() => (item instanceof ChatUser ? item.room_id : item.id));

const user = computed(() => (item instanceof ChatUser ? item : null));
const isActive = computed(() => chat.value.activeRoomId === roomId.value);
const hasNotification = computed(() => !!chat.value.notifications.get(roomId.value));

const isOnline = computed(() => {
	if (!chat.value || !user.value) {
		return null;
	}

	return isUserOnline(chat.value, item.id);
});

const title = computed(() =>
	item instanceof ChatUser ? item.display_name : getChatRoomTitle(item)
);

const meta = computed(() => (item instanceof ChatUser ? `@${item.username}` : null));

const hoverTitle = computed(() => {
	const parts = [title.value];
	if (meta.value) {
		parts.push(meta.value);
	}

	return parts.join(' ');
});

function onClick(e: Event) {
	openChatRoom(chat.value, roomId.value);
	e.preventDefault();
}

/**
 * Only for group chats.
 */
async function leaveRoom() {
	if (!(item instanceof ChatRoomModel)) {
		return;
	}

	const result = await showModalConfirm(
		$gettext(`Are you sure you want to leave the group chat?`)
	);

	if (!result) {
		return;
	}

	leaveGroupRoom(chat.value, item);
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
			<div
				:style="{
					width: `100%`,
					height: `100%`,
				}"
			>
				<AppUserAvatarBubble
					v-if="user"
					:style="{
						width: `100%`,
						height: `100%`,
					}"
					:user="user"
					disable-link
					show-frame
					smoosh
				/>
				<div
					v-else
					:style="{
						width: `100%`,
						height: `100%`,
						borderRadius: `50%`,
						display: `inline-flex`,
						alignItems: `center`,
						justifyContent: `center`,
						verticalAlign: `middle`,
						backgroundColor: kThemeBacklight,
					}"
				>
					<AppJolticon
						:style="{
							color: `${kThemeBacklightFg} !important`,
						}"
						icon="users"
					/>
				</div>
			</div>
		</template>

		<template #leading-float>
			<AppChatUserOnlineStatus
				v-if="isOnline !== null"
				:is-online="isOnline"
				:size="12"
				:segment-width="1.5"
				background-color-base="bg"
			/>
		</template>

		<template #title>
			<span>{{ title }}</span>
			<span v-if="meta" class="tiny text-muted">{{ meta }}</span>
		</template>

		<template v-if="hasNotification" #trailing>
			<AppNotificationBlip v-if="hasNotification" />
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
