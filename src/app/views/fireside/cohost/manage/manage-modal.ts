import { Component, Prop } from 'vue-property-decorator';
import { stringSort } from '../../../../../utils/array';
import { fuzzysearch } from '../../../../../utils/string';
import { sleep } from '../../../../../utils/utils';
import {
	inviteFiresideCohost,
	removeFiresideCohost,
} from '../../../../../_common/fireside/fireside.model';
import AppIllustration from '../../../../../_common/illustration/illustration.vue';
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
		AppIllustration,
	},
})
export default class AppFiresideCohostManageModal extends BaseModal {
	@Prop({ type: FiresideController, required: true }) controller!: FiresideController;

	filterQuery = '';
	usersProcessing: (ChatUser | User)[] = [];
	isOpen = true;

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

	destroyed() {
		this.isOpen = false;
	}

	isUserProcessing(user: ChatUser | User) {
		return this.usersProcessing.some(chatUser => chatUser.id === user.id);
	}

	isUserStreaming(user: ChatUser | User) {
		return (
			this.isCohost(user) &&
			this.controller.rtc?.users.some(i => i.userModel?.id === user.id) === true
		);
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
			const wasCohost = this.isCohost(user);
			if (wasCohost) {
				await removeFiresideCohost(this.controller.fireside, user.id);
			} else {
				await inviteFiresideCohost(this.controller.fireside, user.id);
			}

			while (
				(wasCohost && this.controller.unCohostableUsers.includes(user as User)) ||
				(!wasCohost && this.controller.cohostableChatUsers.includes(user as ChatUser))
			) {
				if (!this.isOpen) {
					break;
				}
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
