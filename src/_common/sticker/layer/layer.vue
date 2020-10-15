<script lang="ts" src="./layer"></script>

<template>
	<div class="-layer">
		<app-sticker-layer-placement-mask v-if="isShowingMask" :layer="layer" />
		<slot />
		<app-sticker-drawer />
	</div>
</template>

