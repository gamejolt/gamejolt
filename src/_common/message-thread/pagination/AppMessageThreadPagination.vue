<script lang="ts" setup>
import { toRef, toRefs } from 'vue';
import AppPagination from '../../pagination/AppPagination.vue';
import AppTimelineListItem from '../../timeline-list/item/AppTimelineListItem.vue';

const props = defineProps({
	itemsPerPage: {
		type: Number,
		required: true,
	},
	totalItems: {
		type: Number,
		required: true,
	},
	currentPage: {
		type: Number,
		required: true,
	},
	pager: {
		type: Boolean,
	},
	preventUrlChange: {
		type: Boolean,
	},
});

const { totalItems, itemsPerPage } = toRefs(props);

const emit = defineEmits({
	pagechange: (..._args: any[]) => true,
});

const hasPages = toRef(() => totalItems.value > itemsPerPage.value);

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
