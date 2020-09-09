import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../utils/string';
import { propRequired } from '../../../../utils/vue';
import { BaseModal } from '../../../../_common/modal/base';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppUserAvatarImg from '../../../../_common/user/user-avatar/img/img.vue';
import { addGroupMembers, addGroupRoom, ChatClient, ChatKey } from '../client';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';

@Component({
	components: {
		AppScrollScroller,
		AppUserAvatarImg,
	},
})
export default class AppChatInviteModal extends BaseModal {
	@Prop(propRequired(Array)) friends!: ChatUser[];
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@InjectReactive(ChatKey) chat!: ChatClient;

	filterQuery = '';
	selectedUsers: ChatUser[] = [];

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
			// Add the other pm user to invited members.
			if (this.room.user) {
				selectedUsers.push(this.room.user.id);
			}
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
