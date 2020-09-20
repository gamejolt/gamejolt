import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { number } from '../../../../../_common/filters/number';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { ChatClient, ChatKey, enterChatRoom, isUserOnline, leaveGroupRoom } from '../../client';
import { ChatRoom, getChatRoomTitle } from '../../room';
import { ChatUser } from '../../user';
import AppChatUserOnlineStatus from '../../user-online-status/user-online-status.vue';

@Component({
	components: {
		AppScrollInview,
		AppChatUserOnlineStatus,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatUserListItem extends Vue {
	@Prop(propRequired()) item!: ChatUser | ChatRoom;
	@Prop(propOptional(ChatRoom)) currentRoom?: ChatRoom;
	@Prop(propOptional(Boolean, false)) showPm!: boolean;

	@InjectReactive(ChatKey) chat!: ChatClient;

	isInview = false;
	isHovered = false;

	readonly Screen = Screen;

	get roomId() {
		return this.item instanceof ChatUser ? this.item.room_id : this.item.id;
	}

	get user() {
		return this.item instanceof ChatUser ? this.item : null;
	}

	get url() {
		return this.user?.url ?? '/';
	}

	get isActive() {
		return this.showPm && this.chat.room && this.chat.room.id === this.roomId;
	}

	get notificationsCount() {
		return this.chat.notifications[this.roomId] || 0;
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

	get isOwner() {
		return this.currentRoom && this.user && this.currentRoom.owner_id === this.user.id;
	}

	onClick(e: Event) {
		if (!this.showPm) {
			return;
		}

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
			this.$gettext(`Are you sure you want to leave the group chat?`),
			undefined,
			'yes'
		);

		if (!result) {
			return;
		}

		leaveGroupRoom(this.chat);
	}
}
