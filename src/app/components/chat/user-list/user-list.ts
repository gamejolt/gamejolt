import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../utils/string';
import { propOptional, propRequired } from '../../../../utils/vue';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatUserListItem from './item/item.vue';

@Component({
	components: {
		AppChatUserListItem,
	},
})
export default class AppChatUserList extends Vue {
	@Prop(propRequired(Array)) users!: ChatUser[];
	@Prop(propOptional(ChatRoom)) room?: ChatRoom;
	@Prop(propOptional(Boolean, false)) showPm!: boolean;
	@Prop(propOptional(Boolean, false)) showModTools!: boolean;

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
