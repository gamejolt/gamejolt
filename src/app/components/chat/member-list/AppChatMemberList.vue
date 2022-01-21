<script lang="ts" setup>
import { computed, PropType, ref, toRefs } from 'vue';
import { fuzzysearch } from '../../../../utils/string';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';
import AppChatMemberListItem from './AppChatMemberListItem.vue';

const props = defineProps({
	users: {
		type: Array as PropType<ChatUser[]>,
		required: true,
	},
	room: {
		type: Object as PropType<ChatRoom>,
		required: true,
	},
	hideFilter: {
		type: Boolean,
	},
});

const { users } = toRefs(props);

const filterQuery = ref('');

const filteredUsers = computed(() => {
	if (!filterQuery.value) {
		return users.value;
	}

	const query = filterQuery.value.toLowerCase().trim();
	return users.value.filter(
		i =>
			fuzzysearch(query, i.display_name.toLowerCase()) ||
			fuzzysearch(query, i.username.toLowerCase())
	);
});
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
			<AppChatMemberListItem
				v-for="user of filteredUsers"
				:key="user.id"
				:user="user"
				:room="room"
			/>
		</ul>
	</div>
</template>
