<template>
	<div class="-item">
		<app-community-add-widget
			v-app-tooltip.right="$gettext(`Create a Community`)"
			@contextmenu.native.prevent
		/>
	</div>
</template>

<style lang="stylus" scoped>
@require '../common'
</style>

<script lang="ts" src="./add-item"></script>
