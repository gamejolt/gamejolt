<template>
	<div class="-sticker-target">
		<app-sticker v-for="sticker of stickers" :key="sticker.id" :sticker="sticker" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.-sticker-target
	position: relative
</style>

<script lang="ts" src="./target"></script>
