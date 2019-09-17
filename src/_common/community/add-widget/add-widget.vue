<template>
	<router-link class="-add" :to="{ name: 'dash.communities.add' }">
		<app-jolticon class="-icon" icon="add" big />
	</router-link>
</template>

<style lang="stylus" scoped>

@require '~styles/variables'
@require '~styles-lib/mixins'

$-border-size = 4px
$-item-size = $shell-cbar-width - $cbar-h-padding * 2 - 2px

.-add
	pressy()
	display: block
	width: $-item-size
	height: $-item-size
	border: $-border-size solid
	border-radius: 100%
	text-align: center
	cursor: pointer

	theme-prop('border-color', 'gray-subtle')
	theme-prop('color', 'gray-subtle')

	.-icon
		margin: 0
		line-height: $-item-size - ($-border-size * 2)

</style>

<script lang="ts" src="./add-widget"></script>
