<script lang="ts">
import { computed, PropType, ref, toRefs } from 'vue';
import AppScrollScroller from '../../../../_common/scroll/AppScrollScroller.vue';
import { UserModel } from '../../../../_common/user/user.model';
import { fuzzysearch } from '../../../../utils/string';
import { ChatRoomModel } from '../room';
import { ChatUser } from '../user';

type ChatListEntry = ChatUser | UserModel | ChatRoomModel;

function searchEntries<T extends ChatListEntry>(entries: T[], query: string): T[] {
	return entries.filter(i => {
		if (i instanceof ChatUser || i instanceof UserModel) {
			return (
				fuzzysearch(query, i.display_name.toLowerCase()) ||
				fuzzysearch(query, i.username.toLowerCase())
			);
		} else if (i instanceof ChatRoomModel) {
			if (i.title) {
				return fuzzysearch(query, i.title.toLowerCase());
			} else {
				return i.fallback_title && fuzzysearch(query, i.fallback_title.toLowerCase());
			}
		}
	});
}

function getKeyForEntry(entry: ChatListEntry) {
	let key = '';
	if (entry instanceof ChatUser) {
		key = 'chat-user-';
	} else if (entry instanceof UserModel) {
		key = 'user-';
	} else if (entry instanceof ChatRoomModel) {
		key = 'chat-room-';
	}

	return key + entry.id;
}
</script>

<script lang="ts" setup generic="T extends ChatListEntry">
const props = defineProps({
	entries: {
		type: Array as PropType<T[]>,
		required: true,
	},
	hideFilter: {
		type: Boolean,
	},
	bleedFilter: {
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
		<div v-if="!hideFilter" class="-input-container" :class="{ '-bleed-filter': bleedFilter }">
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

			<slot name="scroll-end" />
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

	&.-bleed-filter
		padding-left: 0
		padding-right: 0

.-list-scroller
	flex: auto
	padding-top: 8px
</style>
