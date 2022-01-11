import { Inject, mixins, Options, Prop } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../utils/string';
import { BaseModal } from '../../../../_common/modal/base';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import AppUserAvatarList from '../../../../_common/user/user-avatar/list/list.vue';
import { ChatStore, ChatStoreKey } from '../chat-store';
import { addGroupMembers, addGroupRoom } from '../client';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';

@Options({
	components: {
		AppScrollScroller,
		AppUserAvatarImg,
		AppUserAvatarList,
	},
})
export default class AppChatInviteModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) room!: ChatRoom;
	@Prop({ type: Array, required: true }) friends!: ChatUser[];
	@Prop({ type: Object, default: null }) initialUser!: ChatUser | null;

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	filterQuery = '';
	selectedUsers: ChatUser[] = this.initialUser ? [this.initialUser] : [];

	get chat() {
		return this.chatStore.chat!;
	}

	get filteredUsers() {
		if (!this.filterQuery) {
			return this.friends;
		}

		const filter = this.filterQuery.toLowerCase();
		return this.friends.filter(
			i =>
				fuzzysearch(filter, i.display_name.toLowerCase()) ||
				fuzzysearch(filter, i.username.toLowerCase())
		);
	}

	invite() {
		const selectedUsers = this.selectedUsers.map(chatUser => chatUser.id);

		if (this.room.isPmRoom) {
			addGroupRoom(this.chat, selectedUsers);
		} else {
			addGroupMembers(this.chat, this.room.id, selectedUsers);
		}
		this.modal.dismiss();
	}

	toggle(user: ChatUser) {
		const index = this.selectedUsers.findIndex(chatUser => chatUser.id === user.id);
		if (index !== -1) {
			this.selectedUsers.splice(index, 1);
		} else {
			this.selectedUsers.push(user);
		}
	}

	selected(user: ChatUser) {
		return this.selectedUsers.some(chatUser => chatUser.id === user.id);
	}
}
