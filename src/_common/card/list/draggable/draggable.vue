<template>
	<draggable v-model="items" :options="{ handle: '.card-drag-handle' }">
		<slot />
	</draggable>
</template>

<script lang="ts" src="./draggable"></script>
