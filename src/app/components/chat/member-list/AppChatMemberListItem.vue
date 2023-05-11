<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppFiresideLiveTag from '../../../../_common/fireside/AppFiresideLiveTag.vue';
import { FiresideRTCHost } from '../../../../_common/fireside/rtc/host';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { kThemeBg, kThemeFg, kThemePrimary } from '../../../../_common/theme/variables';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/AppUserVerifiedTick.vue';
import { useGridStore } from '../../grid/grid-store';
import AppChatListItem from '../_list/AppChatListItem.vue';
import { isUserOnline } from '../client';
import { ChatRoom } from '../room';
import { ChatUser, getChatUserRoleData } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/AppChatUserOnlineStatus.vue';
import AppChatUserPopover from '../user-popover/AppChatUserPopover.vue';

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

	// TODO(oven)
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
			<div class="-member-avatar">
				<img class="-member-avatar-img" :src="user.img_avatar" />
			</div>
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

<style lang="stylus" scoped>
.-member-avatar
.-member-avatar-img
	width: 100%
	height: 100%

.-nowrap
	overflow: unset !important
	white-space: unset !important
	text-overflow: unset !important
</style>
