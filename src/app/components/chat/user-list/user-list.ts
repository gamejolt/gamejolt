import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../utils/string';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatUserListItem from './item/item.vue';

@Component({
	components: {
		AppChatUserListItem,
	},
})
export default class AppChatUserList extends Vue {
	@Prop(Array)
	users!: ChatUser[];

	@Prop(ChatRoom)
	room?: ChatRoom;

	@Prop(Boolean)
	showPm?: boolean;

	@Prop(Boolean)
	showModTools?: boolean;

	filterQuery = '';

	get filteredUsers() {
		if (!this.filterQuery) {
			return this.users;
		}

		const filter = this.filterQuery.toLowerCase();
		return this.users.filter(
			i =>
				fuzzysearch(filter, i.displayName.toLowerCase()) ||
				fuzzysearch(filter, i.username.toLowerCase())
		);
	}
}
