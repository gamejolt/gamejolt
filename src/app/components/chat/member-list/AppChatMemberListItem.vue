<script lang="ts">
import { computed, inject, PropType, toRefs } from 'vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { ChatStore, ChatStoreKey } from '../chat-store';
import { isUserOnline, tryGetRoomRole } from '../client';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';
import AppChatUserPopover from '../user-popover/user-popover.vue';
import AppChatListItem from '../_list/AppChatListItem.vue';
</script>

<script lang="ts" setup>
const props = defineProps({
	user: {
		type: Object as PropType<ChatUser>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
	horizontalPadding: {
		type: Number,
		default: undefined,
	},
});

const { user, room } = toRefs(props);
const chatStore = inject<ChatStore>(ChatStoreKey)!;

const chat = computed(() => chatStore.chat!);

const isOnline = computed(() => {
	if (!chatStore.chat || room.value.isFiresideRoom) {
		return null;
	}

	return isUserOnline(chat.value, user.value.id);
});

const isOwner = computed(() => room.value.owner_id === user.value.id);

const isModerator = computed(
	() => tryGetRoomRole(chat.value, room.value, user.value) === 'moderator'
);

// In public rooms, display staff member status.
const isStaff = computed(() => !room.value.isPrivateRoom && user.value.permission_level > 0);
</script>

<template>
	<AppChatListItem :horizontal-padding="horizontalPadding">
		<template #leading>
			<div class="-member-avatar">
				<img class="-member-avatar-img" :src="user.img_avatar" />
			</div>
		</template>

		<template #leadingFloat>
			<AppChatUserOnlineStatus
				v-if="isOnline !== null"
				class="-avatar-status"
				:is-online="isOnline"
				:absolute="false"
				:size="8"
				background-color-base="bg"
			/>
		</template>

		<template #title>
			<span>{{ user.display_name }}</span>
			<span class="tiny text-muted">@{{ user.username }}</span>
		</template>

		<template #trailing>
			<span v-if="isOwner" v-app-tooltip="$gettext(`Room Owner`)">
				<AppJolticon icon="crown" />
			</span>
			<span v-else-if="isStaff" v-app-tooltip="$gettext(`Game Jolt Staff`)">
				<AppJolticon icon="gamejolt" />
			</span>
			<span v-else-if="isModerator" v-app-tooltip="$gettext(`Moderator`)">
				<AppJolticon icon="star" />
			</span>
		</template>

		<template #popover>
			<AppChatUserPopover :user="user" :room="room" />
		</template>
	</AppChatListItem>
</template>

<style lang="stylus" scoped>
.-member-avatar
.-member-avatar-img
	width: 100%
	height: 100%

.-group-icon
	display: inline-flex
	align-items: center
	justify-content: center
	vertical-align: middle
	background-color: var(--theme-backlight)

	.jolticon
		color: var(--theme-backlight-fg) !important
</style>
