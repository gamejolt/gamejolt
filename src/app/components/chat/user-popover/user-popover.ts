import Vue from 'vue';
import Component from 'vue-class-component';
import { InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { ModalConfirm } from '../../../../_common/modal/confirm/confirm-service';
import { AppTheme } from '../../../../_common/theme/theme';
import AppUserAvatar from '../../../../_common/user/user-avatar/user-avatar.vue';
import AppUserVerifiedTick from '../../../../_common/user/verified-tick/verified-tick.vue';
import {
	ChatClient,
	ChatKey,
	demoteModerator,
	enterChatRoom,
	isUserOnline,
	kickGroupMember,
	promoteToModerator,
	userCanModerateOtherUser,
} from '../client';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatUserOnlineStatus from '../user-online-status/user-online-status.vue';

@Component({
	components: {
		AppChatUserOnlineStatus,
		AppUserAvatar,
		AppTheme,
		AppUserVerifiedTick,
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

	get isModerator() {
		return this.chat.roomMembers[this.room.id].get(this.user)?.role === 'moderator';
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
		if (!this.chat || !this.chat.currentUser) {
			return false;
		}

		return userCanModerateOtherUser(this.chat, this.room, this.chat.currentUser, this.user);
	}

	get canChangeModerator() {
		if (!this.chat.currentUser) {
			return false;
		}
		if (!this.room.canElectModerators) {
			return false;
		}

		// Only the owner of the room can promote/demote moderators.
		return this.chat.currentUser.id === this.room.owner_id;
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

	async onClickPromoteModerator() {
		const result = await ModalConfirm.show(
			this.$gettextInterpolate(
				`Do you want to promote @%{ username } to Moderator? They will be able to remove messages and kick users from the chat. You can demote them at any time.`,
				{ username: this.user.username }
			)
		);

		if (result) {
			promoteToModerator(this.chat, this.room, this.user.id);
		}
	}

	async onClickDemoteModerator() {
		const result = await ModalConfirm.show(
			this.$gettextInterpolate(`Do you want to demote @%{ username } to User?`, {
				username: this.user.username,
			})
		);

		if (result) {
			demoteModerator(this.chat, this.room, this.user.id);
		}
	}
}
