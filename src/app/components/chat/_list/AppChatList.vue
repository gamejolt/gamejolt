<script lang="ts">
import { computed, PropType, ref, toRefs } from 'vue';
import { fuzzysearch } from '../../../../utils/string';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';

function searchEntries(entries: ChatListEntries, query: string): ChatListEntries {
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

type ChatListEntries = (ChatUser | ChatRoom)[];

export type ChatListSlotProps = {
	items: ChatListEntries;
};
</script>

<script lang="ts" setup>
const props = defineProps({
	entries: {
		type: Array as PropType<ChatListEntries>,
		required: true,
	},
	hideFilter: {
		type: Boolean,
	},
});

const { entries } = toRefs(props);

const filterQuery = ref('');

const filteredEntries = computed(() => {
	if (!filterQuery.value) {
		return entries.value;
	}
	const query = filterQuery.value.toLowerCase().trim();

	return entries.value.filter(i => {
		if (i instanceof ChatUser) {
			return (
				fuzzysearch(query, i.display_name.toLowerCase()) ||
				fuzzysearch(query, i.username.toLowerCase())
			);
		} else if (i instanceof ChatRoom) {
			return searchEntries(i.members, query).length > 0;
		}
	});
});

const slotProps = computed<ChatListSlotProps>(() => ({
	items: filteredEntries.value,
}));
</script>

<template>
	<div>
		<div v-if="!hideFilter" class="nav-controls">
			<input
				v-model="filterQuery"
				text="search"
				class="form-control"
				:placeholder="$gettext(`Filter...`)"
			/>
		</div>

		<slot v-bind="slotProps" />
	</div>
</template>
