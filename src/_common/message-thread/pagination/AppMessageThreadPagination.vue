<script lang="ts" setup>
import { toRef } from 'vue';

import AppPagination from '~common/pagination/AppPagination.vue';
import AppTimelineListItem from '~common/timeline-list/item/AppTimelineListItem.vue';

type Props = {
	itemsPerPage: number;
	totalItems: number;
	currentPage: number;
	pager?: boolean;
	preventUrlChange?: boolean;
};
const { itemsPerPage, totalItems, currentPage, pager, preventUrlChange } = defineProps<Props>();

const emit = defineEmits<{
	pagechange: [...args: any[]];
}>();

const hasPages = toRef(() => totalItems > itemsPerPage);

function pageChange(...args: any[]) {
	emit('pagechange', args);
}
</script>

<template>
	<AppTimelineListItem v-if="hasPages">
		<div class="timeline-list-item-details">
			<br />

			<AppPagination
				:items-per-page="itemsPerPage"
				:total-items="totalItems"
				:current-page="currentPage"
				:pager="pager"
				:prevent-url-change="preventUrlChange"
				@pagechange="pageChange"
			/>
		</div>
	</AppTimelineListItem>
</template>
