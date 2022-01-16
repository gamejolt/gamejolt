<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../utils/string';
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

@Options({
	components: {
		AppChatUserListItem,
	},
})
export default class AppChatUserList extends Vue {
	@Prop({ type: Array, required: true }) entries!: (ChatUser | ChatRoom)[];

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
</script>

<template>
	<div class="chat-user-list">
		<div class="nav-controls">
			<input
				v-model="filterQuery"
				text="search"
				class="form-control"
				:placeholder="$gettext(`Filter...`)"
			/>
		</div>

		<ul v-show="entries.length" class="shell-nav">
			<app-chat-user-list-item
				v-for="user of filteredEntries"
				:key="getKeyForEntry(user)"
				:item="user"
			/>
		</ul>
	</div>
</template>
