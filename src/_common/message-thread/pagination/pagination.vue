<template>
	<app-timeline-list-item v-if="hasPages">
		<div class="timeline-list-item-details">
			<br />

			<app-pagination
				:items-per-page="itemsPerPage"
				:total-items="totalItems"
				:current-page="currentPage"
				:pager="pager"
				:prevent-url-change="preventUrlChange"
				@pagechange="pageChange"
			/>
		</div>
	</app-timeline-list-item>
</template>

<script lang="ts" src="./pagination"></script>
