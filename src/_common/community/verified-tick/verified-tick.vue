<template>
	<app-jolticon
		v-if="community.is_verified"
		:class="{
			'-small': this.small,
		}"
		icon="verified"
		:big="big"
		v-app-tooltip="tooltip"
	/>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

$jolticon-size = 16px

.-small
	margin: 0 2px
	font-size: $jolticon-size * 0.85
</style>

<script lang="ts" src="./verified-tick"></script>
