<script lang="ts" src="./description"></script>

<template>
	<div>
		<app-fade-collapse
			:collapse-height="600"
			:is-open="isDescriptionOpen"
			@require-change="canToggleDescriptionChanged"
		>
			<app-content-viewer :source="channel.description_content" />
		</app-fade-collapse>

		<a v-if="canToggleDescription" class="hidden-text-expander" @click="toggleDescription()" />
	</div>
</template>
