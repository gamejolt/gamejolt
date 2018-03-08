import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./user-list.html';

import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import { AppChatUserListItem } from './item/item';
import { fuzzysearch } from '../../../../lib/gj-lib-client/utils/string';

@View
@Component({
	components: {
		AppChatUserListItem,
	},
})
export class AppChatUserList extends Vue {
	@Prop(Array) users: ChatUser[];
	@Prop(ChatRoom) room?: ChatRoom;
	@Prop(Boolean) showPm?: boolean;
	@Prop(Boolean) showModTools?: boolean;

	filterQuery = '';
	// inviewUsers: { [k: string]: boolean } = {};

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
