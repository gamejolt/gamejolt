import { setup } from 'vue-class-component';
import { mixins, Options, Prop } from 'vue-property-decorator';
import { stringSort } from '../../../../../utils/array';
import { fuzzysearch } from '../../../../../utils/string';
import { sleep } from '../../../../../utils/utils';
import {
	inviteFiresideHost,
	removeFiresideHost,
} from '../../../../../_common/fireside/fireside.model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { BaseModal } from '../../../../../_common/modal/base';
import { useCommonStore } from '../../../../../_common/store/common-store';
import AppUserAvatarImg from '../../../../../_common/user/user-avatar/img/img.vue';
import AppUserAvatarList from '../../../../../_common/user/user-avatar/list/list.vue';
import { User } from '../../../../../_common/user/user.model';
import { ChatUser } from '../../../../components/chat/user';
import { FiresideController } from '../../../../components/fireside/controller/controller';
import { illNoCommentsSmall } from '../../../../img/ill/illustrations';

@Options({
	components: {
		AppUserAvatarImg,
		AppUserAvatarList,
		AppIllustration,
	},
})
export default class AppFiresideCohostManageModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true })
	controller!: FiresideController;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	filterQuery = '';
	usersProcessing: (ChatUser | User)[] = [];
	isOpen = true;

	readonly illNoCommentsSmall = illNoCommentsSmall;

	get rtc() {
		return this.controller.rtc;
	}

	get hostableChatUsers() {
		if (!this.rtc) {
			return [];
		}

		const currentHosts = this.rtc.hosts;
		return (
			this.controller.chatUsers?.collection.filter(
				i => !currentHosts.some(host => host.user.id === i.id)
			) ?? []
		);
	}

	get unhostableUsers() {
		if (!this.rtc) {
			return [];
		}

		return this.rtc.hosts.map(i => i.user).filter(i => i.id !== this.user?.id);
	}

	get users() {
		return [...this.hostableChatUsers, ...this.unhostableUsers].sort((a, b) =>
			stringSort(a.display_name, b.display_name)
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

	unmounted() {
		this.isOpen = false;
	}

	isUserProcessing(user: ChatUser | User) {
		return this.usersProcessing.some(chatUser => chatUser.id === user.id);
	}

	isUserStreaming(user: ChatUser | User) {
		return this.isHost(user) && this.rtc?.users.some(i => i.userModel?.id === user.id) === true;
	}

	isHost(user: ChatUser | User) {
		return user instanceof User;
	}

	async processUser(user: ChatUser | User) {
		if (this.usersProcessing.includes(user)) {
			return;
		}

		this.usersProcessing.push(user);

		try {
			const wasHost = this.isHost(user);
			if (wasHost) {
				await removeFiresideHost(this.controller.fireside, user.id);
			} else {
				await inviteFiresideHost(this.controller.fireside, user.id);
			}

			// We will get a grid message that will update the RTC host list.
			while (
				(wasHost && this.unhostableUsers.includes(user as User)) ||
				(!wasHost && this.hostableChatUsers.includes(user as ChatUser))
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