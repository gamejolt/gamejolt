import { Component, Prop } from 'vue-property-decorator';
import { stringSort } from '../../../../../utils/array';
import { fuzzysearch } from '../../../../../utils/string';
import { sleep } from '../../../../../utils/utils';
import {
	inviteFiresideCohost,
	removeFiresideCohost,
} from '../../../../../_common/fireside/fireside.model';
import { BaseModal } from '../../../../../_common/modal/base';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/img/img.vue';
import AppUserAvatarList from '../../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../../_common/user/user.model';
import { ChatUser } from '../../../../components/chat/user';
import { FiresideController } from '../../../../components/fireside/controller/controller';

@Component({
	components: {
		AppScrollScroller,
		AppUserAvatarImg,
		AppUserAvatarList,
	},
})
export default class AppFiresideCohostManageModal extends BaseModal {
	@Prop({ type: FiresideController, required: true }) controller!: FiresideController;

	filterQuery = '';
	usersProcessing: (ChatUser | User)[] = [];

	get users() {
		return [...this.controller.cohostableChatUsers, ...this.controller.unCohostableUsers].sort(
			(a, b) => stringSort(a.display_name, b.display_name)
		);
	}

	get filteredUsers() {
		if (!this.filterQuery) {
			return this.users;
		}

		const filter = this.filterQuery.toLowerCase();
		return this.users.filter(
			i =>
				fuzzysearch(filter, i.display_name.toLowerCase()) ||
				fuzzysearch(filter, i.username.toLowerCase())
		);
	}

	// toggle(user: ChatUser | User) {
	// 	const index = this.selectedUsers.findIndex(chatUser => chatUser.id === user.id);
	// 	if (index !== -1) {
	// 		this.selectedUsers.splice(index, 1);
	// 	} else {
	// 		this.selectedUsers.push(user);
	// 	}
	// }

	isUserProcessing(user: ChatUser | User) {
		return this.usersProcessing.some(chatUser => chatUser.id === user.id);
	}

	isCohost(user: ChatUser | User) {
		return user instanceof User;
	}

	async processUser(user: ChatUser | User) {
		if (this.usersProcessing.includes(user)) {
			return;
		}

		this.usersProcessing.push(user);

		try {
			const isCohost = this.isCohost(user);
			if (isCohost) {
				await removeFiresideCohost(this.controller.fireside, user.id);
			} else {
				await inviteFiresideCohost(this.controller.fireside, user.id);
			}

			while (
				(isCohost && this.controller.unCohostableUsers.includes(user as User)) ||
				(!isCohost && this.controller.cohostableChatUsers.includes(user as ChatUser))
			) {
				console.warn('waiting to check cohost status...');
				await sleep(250);
			}
		} finally {
			const index = this.usersProcessing.indexOf(user);
			if (index !== -1) {
				this.usersProcessing.splice(index, 1);
			}
		}
	}
}
