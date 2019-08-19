<template>
	<div
		class="meter clearfix"
		:class="{
			'meter-big': big,
			'meter-low': level <= 5,
			'meter-mid': level > 5 && level < 8,
			'meter-high': level >= 8,
			'meter-full': level > 9.5,
		}"
	>
		<div
			class="meter-blip"
			v-for="i of 9"
			:key="i"
			:class="{ 'meter-blip-filled': level >= i - 0.1 }"
		></div>

		<!--
		Since the last bar is special cased to 9.5 instead of 10.
	-->
		<div class="meter-blip" :class="{ 'meter-blip-filled': level >= 9.5 }"></div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$meter-blip-count = 10

.meter-blip
	change-bg('bg-subtle')
	float: left
	display: inline-block
	vertical-align: bottom
	margin-right: 1px
	width: 2px
	overflow: hidden

	.meter-big &
		width: 4px
		margin-right: 2px

.meter-blip-filled
	change-bg('fg')

for i in 1 .. $meter-blip-count
	.meter-blip:nth-child({i})
		height: 10px

		&:nth-child(odd)
			margin-top: 5px
			height: 5px

		.meter-big &
			height: 20px

			&:nth-child(odd)
				margin-top: 10px
				height: 10px
</style>

<script lang="ts" src="./meter"></script>
