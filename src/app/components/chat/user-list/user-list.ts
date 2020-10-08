import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../utils/string';
import { propOptional, propRequired } from '../../../../utils/vue';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatUserListItem from './item/item.vue';

function searchUsers(users: (ChatUser | ChatRoom)[], query: string): (ChatUser | ChatRoom)[] {
	return users.filter(i => {
		if (i instanceof ChatUser) {
			return (
				fuzzysearch(query, i.display_name.toLowerCase()) ||
				fuzzysearch(query, i.username.toLowerCase())
			);
		} else if (i instanceof ChatRoom) {
			return searchUsers(i.members, query).length > 0;
		}
	});
}

@Component({
	components: {
		AppChatUserListItem,
	},
})
export default class AppChatUserList extends Vue {
	@Prop(propRequired(Array)) users!: (ChatUser | ChatRoom)[];
	@Prop(propOptional(ChatRoom)) currentRoom?: ChatRoom;
	@Prop(propOptional(Boolean, false)) showPm!: boolean;

	filterQuery = '';

	get filteredUsers() {
		if (!this.filterQuery) {
			return this.users;
		}

		const query = this.filterQuery.toLowerCase();
		return searchUsers(this.users, query);
	}
}
