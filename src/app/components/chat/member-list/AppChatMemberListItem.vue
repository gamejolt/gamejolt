<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppFiresideLiveTag from '../../../../_common/fireside/AppFiresideLiveTag.vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { useGridStore } from '../../grid/grid-store';
import { isUserOnline, tryGetRoomRole } from '../client';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';
import AppChatUserPopover from '../user-popover/user-popover.vue';
import AppChatListItem from '../_list/AppChatListItem.vue';

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
const { chatUnsafe: chat } = useGridStore();

const isOnline = computed(() => {
	if (!chat.value || room.value.isFiresideRoom) {
		return null;
	}

	return isUserOnline(chat.value, user.value.id);
});

const isOwner = computed(() => room.value.owner_id === user.value.id);

const isLiveFiresideHost = computed(() => user.value.isLive === true);
const isFiresideHost = computed(() => !!user.value.firesideHost);

const isModerator = computed(
	() => tryGetRoomRole(chat.value, room.value, user.value) === 'moderator'
);

// In public rooms, display staff member status.
const isStaff = computed(() => !room.value.isPrivateRoom && user.value.permission_level > 0);
</script>

<template>
	<AppChatListItem
		:horizontal-padding="horizontalPadding"
		:popper-placement="Screen.isMobile ? 'bottom' : 'left'"
		popper-trigger="click"
	>
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
				:size="12"
				:segment-width="1.5"
				background-color-base="bg"
			/>
		</template>

		<template #title>
			<AppFiresideLiveTag
				v-if="isLiveFiresideHost"
				class="-nowrap"
				size="sm"
				sans-elevation
			/>

			<span>{{ user.display_name }}</span>
			<span class="tiny text-muted">@{{ user.username }}</span>
		</template>

		<template #trailing>
			<span v-if="isOwner" v-app-tooltip="$gettext(`Room Owner`)">
				<AppJolticon class="-indicator-icon" icon="crown" />
			</span>
			<span v-else-if="isFiresideHost" v-app-tooltip="$gettext(`Host`)">
				<AppJolticon class="-indicator-icon" icon="star-ten-pointed" />
			</span>

			<span v-if="isModerator" v-app-tooltip="$gettext(`Chat Moderator`)">
				<AppJolticon class="-indicator-icon" icon="star" />
			</span>

			<span v-if="isStaff" v-app-tooltip="$gettext(`Game Jolt Staff`)">
				<AppJolticon class="-indicator-icon" icon="gamejolt" />
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

.-indicator-icon
	color: var(--theme-primary)

.-nowrap
	overflow: unset !important
	white-space: unset !important
	text-overflow: unset !important
</style>
