<script lang="ts">
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	ScrollInviewConfig,
} from '../../../../../_common/scroll/inview/AppScrollInview.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatStore, ChatStoreKey } from '../../chat-store';
import { enterChatRoom, isUserOnline, leaveGroupRoom } from '../../client';
import AppChatNotificationSettings from '../../notification-settings/notification-settings.vue';
import { ChatRoom, getChatRoomTitle } from '../../room';
import { ChatUser } from '../../user';
import AppChatUserOnlineStatus from '../../user-online-status/user-online-status.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });

@Options({
	components: {
		AppScrollInview,
		AppChatUserOnlineStatus,
		AppPopper,
		AppChatNotificationSettings,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatUserListItem extends Vue {
	@Prop({ type: Object, required: true }) item!: ChatUser | ChatRoom;

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	isInview = false;
	isHovered = false;
	readonly InviewConfig = InviewConfig;
	readonly Screen = Screen;

	get chat() {
		return this.chatStore.chat!;
	}

	get roomId() {
		return this.item instanceof ChatUser ? this.item.room_id : this.item.id;
	}

	get user() {
		return this.item instanceof ChatUser ? this.item : null;
	}

	get isActive() {
		return this.chat.room?.id === this.roomId;
	}

	get notificationsCount() {
		return this.chat.notifications[this.roomId] ?? 0;
	}

	get notificationsCountLocalized() {
		return formatNumber(this.notificationsCount);
	}

	get isOnline() {
		if (!this.chat || !this.user) {
			return null;
		}

		return isUserOnline(this.chat, this.item.id);
	}

	get title() {
		return this.item instanceof ChatUser
			? this.item.display_name
			: getChatRoomTitle(this.item, this.chat);
	}

	get meta() {
		return this.item instanceof ChatUser ? `@${this.item.username}` : null;
	}

	get hoverTitle() {
		const parts = [this.title];
		if (this.meta) {
			parts.push(this.meta);
		}

		return parts.join(' ');
	}

	get componentEvents() {
		const events: Record<string, any> = {
			click: this.onClick,
		};

		// Only group chats have an action we need to show on hover.
		if (!this.user) {
			events.mouseenter = this.onMouseEnter;
			events.mouseleave = this.onMouseLeave;
		}

		return events;
	}

	onClick(e: Event) {
		enterChatRoom(this.chat, this.roomId);
		e.preventDefault();
	}

	onMouseEnter() {
		this.isHovered = true;
	}

	onMouseLeave() {
		this.isHovered = false;
	}

	/**
	 * Only for group chats.
	 */
	async leaveRoom() {
		if (!(this.item instanceof ChatRoom)) {
			return;
		}

		const result = await ModalConfirm.show(
			this.$gettext(`Are you sure you want to leave the group chat?`)
		);

		if (!result) {
			return;
		}

		leaveGroupRoom(this.chat, this.item);
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
			popover-class="fill-darkest"
			trigger="right-click"
			placement="bottom"
			block
			fixed
			hide-on-state-change
		>
			<template #default>
				<span>
					<a
						v-if="isInview"
						class="-item"
						:class="{
							active: isActive,
						}"
						:title="hoverTitle"
						v-on="componentEvents"
					>
						<span v-if="notificationsCount" class="tag tag-highlight notifications-tag">
							{{ notificationsCountLocalized }}
						</span>

						<div class="shell-nav-icon">
							<div class="-avatar">
								<template v-if="user">
									<img :src="user.img_avatar" />
									<app-chat-user-online-status
										v-if="isOnline !== null"
										class="-avatar-status"
										:is-online="isOnline"
										:size="12"
									/>
								</template>
								<div v-else class="-group-icon">
									<app-jolticon icon="users" />
								</div>
							</div>
						</div>

						<div class="shell-nav-label">
							{{ title }}
							<span v-if="meta" class="tiny text-muted">{{ meta }}</span>
						</div>
					</a>
				</span>
			</template>

			<template #popover>
				<div class="fill-darker">
					<div class="list-group list-group-dark">
						<app-chat-notification-settings :room-id="roomId" :is-pm-room="!!user" />

						<template v-if="!user">
							<hr />
							<a class="list-group-item has-icon" @click="leaveRoom">
								<app-jolticon icon="logout" notice />
								<translate>Leave Room</translate>
							</a>
						</template>
					</div>
				</div>
			</template>
		</app-popper>
	</app-scroll-inview>
</template>

<style lang="stylus" scoped>
.-container
	height: 50px
	overflow: hidden

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

.-action
	display: inline-block
	float: right
	padding-left: 8px
	color: var(--theme-fg-muted) !important

	&:hover
		color: var(--theme-fg) !important
</style>
