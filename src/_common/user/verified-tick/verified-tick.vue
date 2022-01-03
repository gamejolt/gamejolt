<script lang="ts" src="./verified-tick"></script>

<template>
	<app-jolticon
		v-if="shouldShow"
		v-app-tooltip="tooltip"
		:class="{
			'-highlight': highlight,
			'-vertical-align': verticalAlign,
			'-small': small,
		}"
		:icon="icon"
		:big="big"
	/>
</template>

<style lang="stylus" scoped>
$jolticon-size = 16px

.-vertical-align
	vertical-align: middle

.-highlight
	theme-prop('color', 'highlight')

.-small
	margin: 0 2px
	font-size: $jolticon-size * 0.85
</style>
