<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppFiresideLiveTag from '../../../../_common/fireside/AppFiresideLiveTag.vue';
import { FiresideRTCHost } from '../../../../_common/fireside/rtc/rtc';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { kThemeBg, kThemeFg, kThemePrimary } from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/AppUserVerifiedTick.vue';
import { useGridStore } from '../../grid/grid-store';
import AppUserAvatarBubble from '../../user/AppUserAvatarBubble.vue';
import { isUserOnline } from '../client';
import { ChatRoom } from '../room';
import { ChatUser, getChatUserRoleData } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';
import AppChatUserPopover from '../user-popover/AppChatUserPopover.vue';
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
	host: {
		type: Object as PropType<FiresideRTCHost>,
		default: undefined,
	},
	horizontalPadding: {
		type: Number,
		default: undefined,
	},
});

const { user, room, host } = toRefs(props);
const { chatUnsafe: chat } = useGridStore();

const showVerificationData = computed(() => room.value.isFiresideRoom);
const isOnline = computed(() => {
	if (!chat.value || showVerificationData.value) {
		return null;
	}

	return isUserOnline(chat.value, user.value.id);
});

const roleData = computed(() => getChatUserRoleData(room.value, user.value));
const isLiveFiresideHost = computed(() => {
	if (!host?.value) {
		return false;
	}

	return !host.value.needsPermissionToView && host.value.isLive;
});
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
			<AppUserVerifiedTick
				v-if="showVerificationData"
				:style="{
					borderRadius: '50%',
					backgroundColor: kThemeBg,
					color: kThemeFg,
					margin: '4px 0px 0px',
					padding: '1px',
				}"
				:user="user"
				small
			/>
			<AppChatUserOnlineStatus
				v-else-if="isOnline !== null"
				:is-online="isOnline"
				:size="12"
				:segment-width="1.5"
				background-color-base="bg"
			/>
		</template>

		<template #title>
			<AppFiresideLiveTag
				v-if="isLiveFiresideHost"
				:style="{
					overflow: `unset !important`,
					whiteSpace: `unset !important`,
					textOverflow: `unset !important`,
				}"
				size="sm"
				sans-elevation
			/>

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
