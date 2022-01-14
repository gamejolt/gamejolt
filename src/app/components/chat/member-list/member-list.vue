<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { fuzzysearch } from '../../../../utils/string';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatMemberListItem from './item/item.vue';

@Options({
	components: {
		AppChatMemberListItem,
	},
})
export default class AppChatMemberList extends Vue {
	@Prop({ type: Array, required: true }) users!: ChatUser[];
	@Prop({ type: Object, required: true }) room!: ChatRoom;
	@Prop({ type: Boolean, default: false }) hideFilter!: boolean;

	filterQuery = '';

	get filteredUsers() {
		if (!this.filterQuery) {
			return this.users;
		}

		const query = this.filterQuery.toLowerCase().trim();
		return this.users.filter(
			i =>
				fuzzysearch(query, i.display_name.toLowerCase()) ||
				fuzzysearch(query, i.username.toLowerCase())
		);
	}
}
</script>

<template>
	<div class="chat-user-list">
		<div v-if="!hideFilter" class="nav-controls">
			<input
				v-model="filterQuery"
				text="search"
				class="form-control"
				:placeholder="$gettext(`Filter...`)"
			/>
		</div>

		<ul v-show="users.length" class="shell-nav">
			<app-chat-member-list-item
				v-for="user of filteredUsers"
				:key="user.id"
				:user="user"
				:room="room"
			/>
		</ul>
	</div>
</template>
