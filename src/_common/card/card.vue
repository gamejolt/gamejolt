<template>
	<div
		class="card fill-darkest"
		:class="{
			'card-disabled': isDisabled,
			'card-expandable': isExpandable,
			'card-draggable': isDraggable,
		}"
	>
		<div class="card-chevron" v-if="isExpandable">
			<app-jolticon :icon="isExpanded ? 'chevron-down' : 'chevron-right'" />
		</div>

		<slot></slot>
	</div>
</template>

<script lang="ts" src="./card"></script>
