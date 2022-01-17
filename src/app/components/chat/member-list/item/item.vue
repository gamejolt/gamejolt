<script lang="ts">
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatStore, ChatStoreKey } from '../../chat-store';
import { isUserOnline, tryGetRoomRole } from '../../client';
import { ChatRoom } from '../../room';
import { ChatUser } from '../../user';
import AppChatUserOnlineStatus from '../../user-online-status/user-online-status.vue';
import AppChatUserPopover from '../../user-popover/user-popover.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });

@Options({
	components: {
		AppScrollInview,
		AppChatUserOnlineStatus,
		AppPopper,
		AppChatUserPopover,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatMemberListItem extends Vue {
	@Prop({ type: Object, required: true }) user!: ChatUser;
	@Prop({ type: Object, required: true }) room!: ChatRoom;

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	readonly InviewConfig = InviewConfig;
	readonly Screen = Screen;

	isInview = false;

	get chat() {
		return this.chatStore.chat!;
	}

	get isOnline() {
		if (!this.chatStore.chat || this.room.isFiresideRoom) {
			return null;
		}

		return isUserOnline(this.chat, this.user.id);
	}

	get isOwner() {
		return this.room.owner_id === this.user.id;
	}

	get isModerator() {
		const role = tryGetRoomRole(this.chat, this.room, this.user);
		return role === 'moderator';
	}

	get isStaff() {
		// In public rooms, display staff member status.
		return !this.room.isPrivateRoom && this.user.permission_level > 0;
	}
}
</script>

<template>
	<app-scroll-inview
		tag="li"
		class="-container"
		:config="InviewConfig"
		@inview="isInview = true"
		@outview="isInview = false"
	>
		<app-popper
			v-if="isInview"
			popover-class="fill-darkest"
			block
			:placement="Screen.isMobile ? 'bottom' : 'left'"
		>
			<a>
				<div class="shell-nav-icon">
					<div class="-avatar">
						<img :src="user.img_avatar" />
						<app-chat-user-online-status
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
							<app-jolticon icon="crown" />
						</span>
						<span v-else-if="isStaff" v-app-tooltip="$gettext(`Game Jolt Staff`)">
							<app-jolticon icon="gamejolt" />
						</span>
						<span v-else-if="isModerator" v-app-tooltip="$gettext(`Moderator`)">
							<app-jolticon icon="star" />
						</span>
					</span>
					<span>{{ user.display_name }}</span>
					<span class="tiny text-muted">@{{ user.username }}</span>
				</div>
			</a>

			<template #popover>
				<app-chat-user-popover :user="user" :room="room" />
			</template>
		</app-popper>
	</app-scroll-inview>
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
