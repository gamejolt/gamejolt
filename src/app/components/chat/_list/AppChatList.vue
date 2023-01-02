<script lang="ts">
import { computed, PropType, ref, toRefs } from 'vue';
import { fuzzysearch } from '../../../../utils/string';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
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
			return searchEntries(i.memberCollection.users, query).length > 0;
		}
	});
}

type ChatListEntry = ChatUser | ChatRoom;
type ChatListEntries = ChatListEntry[];

export type ChatListSlotProps = {
	item: ChatListEntry;
};

function getKeyForEntry(entry: ChatUser | ChatRoom) {
	let key = '';
	if (entry instanceof ChatUser) {
		key = 'chat-user-';
	} else if (entry instanceof ChatRoom) {
		key = 'chat-room-';
	}

	return key + entry.id;
}
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
	return searchEntries(entries.value, query);
});

const mappedEntries = computed(() =>
	filteredEntries.value.map(item => ({ key: getKeyForEntry(item), item }))
);
</script>

<template>
	<div class="chat-list">
		<div v-if="!hideFilter" class="-input-container">
			<input
				v-model="filterQuery"
				text="search"
				class="form-control"
				:placeholder="$gettext(`Filter...`)"
			/>
		</div>

		<AppScrollScroller v-if="mappedEntries.length" class="-list-scroller" thin>
			<template v-for="{ key, item } of mappedEntries" :key="key">
				<slot v-bind="{ item }" />
			</template>
		</AppScrollScroller>
		<div v-else class="-empty">
			<slot name="empty" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.chat-list
	flex: auto
	display: flex
	flex-direction: column
	min-height: 0

.-input-container
	padding: 0 16px
	position: relative
	z-index: 1

.-list-scroller
	flex: auto
	padding-top: 8px
</style>
