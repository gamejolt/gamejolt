<script lang="ts" setup>
import { computed } from 'vue';

import AppChatListItem from '~app/components/chat/_list/AppChatListItem.vue';
import { isUserOnline } from '~app/components/chat/client';
import { ChatRoomModel } from '~app/components/chat/room';
import { ChatUser, getChatUserRoleData } from '~app/components/chat/user';
import AppChatUserOnlineStatus from '~app/components/chat/user-online-status/AppChatUserOnlineStatus.vue';
import AppChatUserPopover from '~app/components/chat/user-popover/AppChatUserPopover.vue';
import { useGridStore } from '~app/components/grid/grid-store';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { Screen } from '~common/screen/screen-service';
import { kThemePrimary } from '~common/theme/variables';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppUserAvatarBubble from '~common/user/user-avatar/AppUserAvatarBubble.vue';

type Props = {
	user: ChatUser;
	room: ChatRoomModel;
	horizontalPadding?: number;
};
const { user, room, horizontalPadding } = defineProps<Props>();
const { chatUnsafe: chat } = useGridStore();

const isOnline = computed(() => {
	if (!chat.value) {
		return null;
	}

	return isUserOnline(chat.value, user.id);
});

const roleData = computed(() => getChatUserRoleData(room, user));
</script>

<template>
	<AppChatListItem
		:horizontal-padding="horizontalPadding"
		:popper-placement="Screen.isMobile ? 'bottom' : 'left'"
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

		<template v-if="roleData" #trailing>
			<span v-app-tooltip="roleData.tooltip">
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
