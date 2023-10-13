<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { kThemePrimary } from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserAvatarBubble from '../../../../_common/user/user-avatar/AppUserAvatarBubble.vue';
import { useGridStore } from '../../grid/grid-store';
import AppChatListItem from '../_list/AppChatListItem.vue';
import { isUserOnline } from '../client';
import { ChatRoomModel } from '../room';
import { ChatUser, getChatUserRoleData } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';
import AppChatUserPopover from '../user-popover/AppChatUserPopover.vue';

const props = defineProps({
	user: {
		type: Object as PropType<ChatUser>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoomModel>,
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
	if (!chat.value) {
		return null;
	}

	return isUserOnline(chat.value, user.value.id);
});

const roleData = computed(() => getChatUserRoleData(room.value, user.value));
</script>

<template>
	<AppChatListItem
		:horizontal-padding="horizontalPadding"
		:popper-placement="Screen.isMobile ? 'bottom' : 'left'"
		:defined-slots="roleData ? ['leading', 'title', 'trailing'] : ['leading', 'title']"
		popper-trigger="click"
	>
		<template #leading>
			<AppUserAvatarBubble
				:style="{
					width: `100%`,
					height: `100%`,
				}"
				:user="user"
				disable-link
				show-frame
				smoosh
			/>
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
			<span>{{ user.display_name }}</span>
			<span class="tiny text-muted">@{{ user.username }}</span>
		</template>

		<template #trailing>
			<span v-if="roleData" v-app-tooltip="roleData.tooltip">
				<AppJolticon
					:style="{
						color: kThemePrimary,
					}"
					:icon="roleData.icon"
				/>
			</span>
		</template>

		<template #popover>
			<AppChatUserPopover :user="user" :room="room" />
		</template>
	</AppChatListItem>
</template>
