<template>
	<app-jolticon
		v-if="shouldShow"
		:class="{
			'-highlight': this.highlight,
			'-vertical-align': this.verticalAlign,
			'-small': this.small,
		}"
		:icon="icon"
		:big="big"
		v-app-tooltip="tooltip"
	/>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$jolticon-size = 16px

.-vertical-align
	vertical-align: middle

.-highlight
	theme-prop('color', 'highlight')

.-small
	margin: 0 2px
	font-size: $jolticon-size * 0.85
</style>

<script lang="ts" src="./verified-tick"></script>
