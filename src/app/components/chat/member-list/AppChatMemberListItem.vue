<script lang="ts" setup>
import { computed, inject, PropType, ref, toRefs } from 'vue';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppPopper from '../../../../_common/popper/popper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../_common/scroll/inview/AppScrollInview.vue';
import { AppTooltip as vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { ChatStore, ChatStoreKey } from '../chat-store';
import { isUserOnline, tryGetRoomRole } from '../client';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/user-online-status.vue';
import AppChatUserPopover from '../user-popover/user-popover.vue';

const props = defineProps({
	user: {
		type: Object as PropType<ChatUser>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
});

const { user, room } = toRefs(props);
const chatStore = inject<ChatStore>(ChatStoreKey)!;

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });

const isInview = ref(false);

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
	<AppScrollInview
		tag="li"
		class="-container"
		:config="InviewConfig"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<AppPopper
			v-if="isInview"
			popover-class="fill-darkest"
			block
			:placement="Screen.isMobile ? 'bottom' : 'left'"
		>
			<a>
				<div class="shell-nav-icon">
					<div class="-avatar">
						<img :src="user.img_avatar" />
						<AppChatUserOnlineStatus
							v-if="isOnline !== null"
							class="-avatar-status"
							:is-online="isOnline"
							:size="12"
						/>
					</div>
				</div>

				<div class="shell-nav-label">
					<span class="-row-icon">
						<span v-if="isOwner" v-app-tooltip="$gettext(`Room Owner`)">
							<AppJolticon icon="crown" />
						</span>
						<span v-else-if="isStaff" v-app-tooltip="$gettext(`Game Jolt Staff`)">
							<AppJolticon icon="gamejolt" />
						</span>
						<span v-else-if="isModerator" v-app-tooltip="$gettext(`Moderator`)">
							<AppJolticon icon="star" />
						</span>
					</span>
					{{ ' ' }}
					<span>{{ user.display_name }}</span>
					{{ ' ' }}
					<span class="tiny text-muted">@{{ user.username }}</span>
				</div>
			</a>

			<template #popover>
				<AppChatUserPopover :user="user" :room="room" />
			</template>
		</AppPopper>
	</AppScrollInview>
</template>

<style lang="stylus" scoped>
.-container
	height: 50px
	overflow: hidden
	rounded-corners()

.-row-icon
	vertical-align: middle

.-avatar
	position: relative

	img
		img-circle()
		display: inline-block
		width: 24px
		vertical-align: middle

	.-group-icon
		img-circle()
		display: inline-flex
		align-items: center
		justify-content: center
		vertical-align: middle
		width: 32px
		height: 32px
		background-color: var(--theme-backlight)

		.jolticon
			color: var(--theme-backlight-fg) !important

	&-status
		right: 12px
		bottom: 10px
</style>
