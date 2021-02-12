<script lang="ts" src="./card"></script>

<template>
	<div
		class="card fill-darkest"
		:class="{
			'card-disabled': isDisabled,
			'card-expandable': isExpandable,
			'card-draggable': isDraggable,
			'card-expandable-padding': forceExpandablePadding,
		}"
	>
		<div v-if="isExpandable" class="card-chevron">
			<app-jolticon :icon="isExpanded ? 'chevron-down' : 'chevron-right'" />
		</div>

		<slot />
	</div>
</template>
