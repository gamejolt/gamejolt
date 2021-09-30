import { Component, Prop } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../../utils/string';
import { inviteFiresideCohost } from '../../../../../_common/fireside/fireside.model';
import { BaseModal } from '../../../../../_common/modal/base';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/img/img.vue';
import AppUserAvatarList from '../../../../../_common/user/user-avatar/list/list.vue';
import { ChatUser } from '../../../../components/chat/user';
import { FiresideController } from '../../../../components/fireside/controller/controller';

@Component({
	components: {
		AppScrollScroller,
		AppUserAvatarImg,
		AppUserAvatarList,
	},
})
export default class AppFiresideCohostInviteModal extends BaseModal {
	@Prop({ type: FiresideController, required: true }) controller!: FiresideController;

	filterQuery = '';
	selectedUsers: ChatUser[] = [];

	get filteredUsers() {
		if (!this.filterQuery) {
			return this.controller.cohostableChatUsers;
		}

		const filter = this.filterQuery.toLowerCase();
		return this.controller.cohostableChatUsers.filter(
			i =>
				fuzzysearch(filter, i.display_name.toLowerCase()) ||
				fuzzysearch(filter, i.username.toLowerCase())
		);
	}

	async invite() {
		const selectedUsers = this.selectedUsers.map(chatUser => chatUser.id);
		for (const user of selectedUsers) {
			const response = await inviteFiresideCohost(this.controller.fireside, user);
			console.warn(response, user);
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
