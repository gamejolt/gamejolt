<template>
	<router-link
		class="-add"
		:style="{
			width: `${size}px`,
			height: `${size}px`,
		}"
		:to="{ name: 'dash.communities.add' }"
	>
		<app-jolticon
			class="-icon"
			:style="{
				// size - (border size * 2)
				'line-height': `${size - 8}px`,
			}"
			icon="add"
			big
		/>
	</router-link>
</template>

<style lang="stylus" scoped>

@require '~styles/variables'
@require '~styles-lib/mixins'

.-add
	pressy()
	display: block
	border: 4px solid
	border-radius: 100%
	text-align: center
	cursor: pointer

	theme-prop('border-color', 'gray-subtle')
	theme-prop('color', 'gray-subtle')

	.-icon
		margin: 0
		// line-height: $-item-size - ($-border-size * 2)

</style>

<script lang="ts" src="./add-widget"></script>
