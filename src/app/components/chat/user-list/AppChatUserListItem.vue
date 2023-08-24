<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { formatNumber } from '../../../../_common/filters/number';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { showModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { kThemeBacklight, kThemeBacklightFg } from '../../../../_common/theme/variables';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { useGridStore } from '../../grid/grid-store';
import AppChatListItem from '../_list/AppChatListItem.vue';
import { isUserOnline, leaveGroupRoom, openChatRoom } from '../client';
import AppChatNotificationSettings from '../notification-settings/notification-settings.vue';
import { ChatRoomModel, getChatRoomTitle } from '../room';
import { ChatUser } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';

const props = defineProps({
	item: {
		type: Object as PropType<ChatUser | ChatRoomModel>,
		required: true,
	},
});

const { item } = toRefs(props);

const { chatUnsafe: chat } = useGridStore();

const roomId = computed(() =>
	item.value instanceof ChatUser ? item.value.room_id : item.value.id
);

const user = computed(() => (item.value instanceof ChatUser ? item.value : null));
const isActive = computed(() => chat.value.activeRoomId === roomId.value);
const notificationsCount = computed(() => chat.value.notifications.get(roomId.value) || 0);

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
	openChatRoom(chat.value, roomId.value);
	e.preventDefault();
}

/**
 * Only for group chats.
 */
async function leaveRoom() {
	if (!(item.value instanceof ChatRoomModel)) {
		return;
	}

	const result = await showModalConfirm(
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
		:defined-slots="
			notificationsCount ? ['leading', 'title', 'trailing'] : ['leading', 'title']
		"
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
