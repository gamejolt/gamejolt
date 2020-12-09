import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../utils/string';
import { propOptional, propRequired } from '../../../../utils/vue';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatUserListItem from './item/item.vue';

function searchEntries(entries: (ChatUser | ChatRoom)[], query: string): (ChatUser | ChatRoom)[] {
	return entries.filter(i => {
		if (i instanceof ChatUser) {
			return (
				fuzzysearch(query, i.display_name.toLowerCase()) ||
				fuzzysearch(query, i.username.toLowerCase())
			);
		} else if (i instanceof ChatRoom) {
			return searchEntries(i.members, query).length > 0;
		}
	});
}

@Component({
	components: {
		AppChatUserListItem,
	},
})
export default class AppChatUserList extends Vue {
	@Prop(propRequired(Array)) entries!: (ChatUser | ChatRoom)[];
	@Prop(propOptional(ChatRoom)) currentRoom?: ChatRoom;
	@Prop(propOptional(Boolean, false)) showPm!: boolean;

	filterQuery = '';

	get filteredEntries() {
		if (!this.filterQuery) {
			return this.entries;
		}

		const query = this.filterQuery.toLowerCase();
		return searchEntries(this.entries, query);
	}

	getKeyForEntry(entry: ChatUser | ChatRoom) {
		let key = '';
		if (entry instanceof ChatUser) {
			key = 'chat-user-';
		} else if (entry instanceof ChatRoom) {
			key = 'chat-room-';
		}

		return key + entry.id;
	}
}
