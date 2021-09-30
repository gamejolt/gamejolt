import { Component, Prop } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../../utils/string';
import { removeFiresideCohost } from '../../../../../_common/fireside/fireside.model';
import { BaseModal } from '../../../../../_common/modal/base';
import AppScrollScroller from '../../../../../_common/scroll/scroller/scroller.vue';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/img/img.vue';
import AppUserAvatarList from '../../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../../_common/user/user.model';
import { FiresideController } from '../../../../components/fireside/controller/controller';

@Component({
	components: {
		AppScrollScroller,
		AppUserAvatarImg,
		AppUserAvatarList,
	},
})
export default class AppFiresideCohostRemoveModal extends BaseModal {
	@Prop({ type: FiresideController, required: true }) controller!: FiresideController;

	filterQuery = '';
	selectedUsers: User[] = [];

	get filteredUsers() {
		const users = this.controller.unCohostableUsers;
		if (!this.filterQuery) {
			return users;
		}

		const filter = this.filterQuery.toLowerCase();
		return users.filter(
			i =>
				fuzzysearch(filter, i.display_name.toLowerCase()) ||
				fuzzysearch(filter, i.username.toLowerCase())
		);
	}

	async invite() {
		try {
			const selectedUsers = this.selectedUsers.map(i => i.id);
			for (const user of selectedUsers) {
				const response = await removeFiresideCohost(this.controller.fireside, user);
				console.warn(response, user);
			}
		} catch (e) {
			// why
			console.error(e);
		}
		this.modal.dismiss();
	}

	toggle(user: User) {
		const index = this.selectedUsers.findIndex(i => i.id === user.id);
		if (index !== -1) {
			this.selectedUsers.splice(index, 1);
		} else {
			this.selectedUsers.push(user);
		}
	}

	selected(user: User) {
		return this.selectedUsers.some(i => i.id === user.id);
	}
}
