<script lang="ts">
import { computed, ref } from 'vue';

import { ChatRoomModel } from '~app/components/chat/room';
import { ChatUser } from '~app/components/chat/user';
import AppScrollScroller from '~common/scroll/AppScrollScroller.vue';
import { UserModel } from '~common/user/user.model';
import { fuzzysearch } from '~utils/string';

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
type Props = {
	entries: T[];
	hideFilter?: boolean;
	bleedFilter?: boolean;
};
const { entries, hideFilter = false, bleedFilter = false } = defineProps<Props>();

const filterQuery = ref('');

const filteredEntries = computed(() => {
	if (!filterQuery.value) {
		return entries;
	}
	const query = filterQuery.value.toLowerCase().trim();
	return searchEntries(entries, query);
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
				class="form-control"
				:placeholder="$gettext(`Filter...`)"
			/>
		</div>

		<AppScrollScroller v-if="mappedEntries.length" class="-list-scroller" thin>
			<template v-for="{ key: _key, item } of mappedEntries" :key="_key">
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
