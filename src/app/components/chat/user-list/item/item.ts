import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { number } from '../../../../../_common/filters/number';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ScrollInviewConfig } from '../../../../../_common/scroll/inview/config';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatClient, ChatKey, enterChatRoom, isUserOnline, leaveGroupRoom } from '../../client';
import AppChatNotificationSettings from '../../notification-settings/notification-settings.vue';
import { ChatRoom, getChatRoomTitle } from '../../room';
import { ChatUser } from '../../user';
import AppChatUserOnlineStatus from '../../user-online-status/user-online-status.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });

@Component({
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
	@Prop(propRequired()) item!: ChatUser | ChatRoom;

	@Inject({ from: ChatKey })
	chat!: ChatClient;

	isInview = false;
	isHovered = false;
	readonly InviewConfig = InviewConfig;
	readonly Screen = Screen;

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
		return number(this.notificationsCount);
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
