<template>
	<div class="-sticker-target" :id="divId" @dragover="onDragOver" @drop="onDrop" ref="target">
		<app-sticker v-for="sticker of stickers" :sticker="sticker" :key="sticker.id" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
	.-sticker-target
		position: relative
</style>

<script lang="ts" src="./target"></script>
