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
	<div class="chat-list">
		<div class="-input-container">
			<input
				v-if="!hideFilter"
				v-model="filterQuery"
				text="search"
				class="form-control"
				:placeholder="$gettext(`Filter...`)"
			/>
			<div class="-scroll-fade" />
		</div>

		<AppScrollScroller class="-list-scroller" thin>
			<slot v-bind="slotProps" />
		</AppScrollScroller>
	</div>
</template>

<style lang="stylus" scoped>
.chat-list
	display: flex
	flex-direction: column
	min-height: 0
	flex: auto

.-input-container
	padding: 0 16px
	position: relative
	z-index: 1

.-scroll-fade
	position: absolute
	left: 0
	top: 100%
	right: 0
	height: 16px
	background-image: unquote('linear-gradient(to bottom, var(--theme-bg-actual), transparent)')

.-list-scroller
	flex: auto
	padding-top: 8px
</style>
