import Vue from 'vue';
import Component from 'vue-class-component';
import { InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ScrollInviewConfig } from '../../../../../_common/scroll/inview/config';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import { ChatClient, ChatKey, enterChatRoom, isUserOnline, kickGroupMember } from '../../client';
import { ChatUser } from '../../user';
import AppChatUserOnlineStatus from '../../user-online-status/user-online-status.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height / 2}px` });

@Component({
	components: {
		AppScrollInview,
		AppChatUserOnlineStatus,
		AppPopper,
		AppUserAvatar,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppChatMemberListItem extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;
	@Prop(propRequired(ChatUser)) user!: ChatUser;

	readonly InviewConfig = InviewConfig;
	readonly Screen = Screen;

	isInview = false;

	get currentRoom() {
		return this.chat.room;
	}

	get isOnline() {
		if (!this.chat) {
			return null;
		}

		return isUserOnline(this.chat, this.user.id);
	}

	get isOwner() {
		return this.currentRoom && this.currentRoom.owner_id === this.user.id;
	}

	get canMessage() {
		return this.chat.friendsList.get(this.user) !== undefined;
	}

	get canModerate() {
		if (!this.chat) {
			return false;
		}

		return (
			this.chat.currentUser &&
			this.currentRoom &&
			this.chat.currentUser.id === this.currentRoom.owner_id &&
			!this.isOwner
		);
	}

	onClickSendMessage() {
		const friend = this.chat.friendsList.get(this.user);
		if (friend) {
			console.log(friend.room_id);
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
					`Are you sure you want to kick @%{ username } from this room? You are not friends with this user, so you cannot invite them back into this room.`,
					{ username: this.user.username }
			  );
		const confirm = await ModalConfirm.show(
			message,
			this.$gettextInterpolate(`Kick @%{ username }`, { username: this.user.username })
		);

		if (confirm) {
			kickGroupMember(this.chat, this.user.id);
		}
	}
}
