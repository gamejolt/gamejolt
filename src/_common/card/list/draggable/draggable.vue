<template>
	<draggable
		v-model="items"
		:options="{ handle: '.card-drag-handle', delay: 100, delayOnTouchOnly: true }"
	>
		<slot />
	</draggable>
</template>

<script lang="ts" src="./draggable"></script>
