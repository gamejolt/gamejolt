import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../utils/string';
import { propOptional, propRequired } from '../../../../utils/vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatMemberListItem from './item/item.vue';

@Component({
	components: {
		AppChatMemberListItem,
	},
})
export default class AppChatMemberList extends Vue {
	@Prop(propRequired(Array)) users!: ChatUser[];
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@Prop(propOptional(Boolean, false)) hideFilter!: boolean;

	@AppState
	user!: AppStore['user'];

	filterQuery = '';

	get allUsers() {
		if (!this.user) {
			return this.users;
		}

		if (!this.users.some(i => i.id === this.user!.id)) {
			const fakeUser = ChatUser.fromUser(this.user, this.room.id);
			// Your own user is sorted to the top of the list.
			return [fakeUser, ...this.users];
		}

		return this.users;
	}

	get filteredUsers() {
		if (!this.filterQuery) {
			return this.allUsers;
		}

		const query = this.filterQuery.toLowerCase().trim();
		return this.allUsers.filter(
			i =>
				fuzzysearch(query, i.display_name.toLowerCase()) ||
				fuzzysearch(query, i.username.toLowerCase())
		);
	}
}
