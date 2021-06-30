import Vue from 'vue';
import Component from 'vue-class-component';
import { InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { AppTheme } from '../../../../_common/theme/theme';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import { ChatClient, ChatKey, enterChatRoom, isUserOnline, kickGroupMember } from '../client';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/user-online-status.vue';

@Component({
	components: {
		AppChatUserOnlineStatus,
		AppUserAvatar,
		AppTheme,
	},
})
export default class AppChatUserPopover extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;
	@Prop(propRequired(ChatUser)) user!: ChatUser;
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;

	get isOnline() {
		if (!this.chat) {
			return null;
		}

		return isUserOnline(this.chat, this.user.id);
	}

	get isOwner() {
		return this.room.owner_id === this.user.id;
	}

	get canMessage() {
		// Don't show "Send message" link when already in PM room with the user.
		if (this.room.isPmRoom) {
			return false;
		}

		// Show when users are friends.
		return this.chat.friendsList.get(this.user) !== undefined;
	}

	get canModerate() {
		if (!this.chat) {
			return false;
		}

		return (
			this.chat.currentUser &&
			this.chat.currentUser.id === this.room.owner_id &&
			!this.isOwner
		);
	}

	onClickSendMessage() {
		const friend = this.chat.friendsList.get(this.user);
		if (friend) {
			enterChatRoom(this.chat, friend.room_id);
		}
	}

	async onClickKick() {
		const message = this.canMessage
			? this.$gettextInterpolate(
					`Are you sure you want to kick @%{ username } from this room?`,
					{ username: this.user.username }
			  )
			: this.$gettextInterpolate(
					`Are you sure you want to kick @%{ username } from this room? You're not friends with this user, so you won't be able to invite them back into this room.`,
					{ username: this.user.username }
			  );
		const confirm = await ModalConfirm.show(
			message,
			this.$gettextInterpolate(`Kick @%{ username }`, { username: this.user.username })
		);

		if (confirm) {
			kickGroupMember(this.chat, this.room, this.user.id);
		}
	}
}
