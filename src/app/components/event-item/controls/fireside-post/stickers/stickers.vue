<template>
	<app-button
		icon="bolt-filled"
		circle
		trans
		:solid="isActive"
		:primary="isActive"
		@click="click()"
		v-app-tooltip="$gettext('Stickers')"
	/>
</template>

<style lang="stylus" scoped>

</style>

<script lang="ts" src="./stickers"></script>
