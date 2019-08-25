<template>
	<div v-if="_items.length" class="widget-compiler-widget-game-media">
		<app-media-bar no-overlay-scrollbars :media-items="_items" />
	</div>
</template>

<script lang="ts" src="./widget-game-media"></script>
