<template>
	<router-link class="-add" :to="{ name: 'dash.communities.add' }">
		<app-jolticon class="-icon" icon="add" big />
	</router-link>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-add
	pressy()
	display: flex
	justify-content: center
	align-items: center
	border: 1px dashed
	border-radius: 100%
	cursor: pointer
	position: absolute
	width: 100%
	height: 100%
	outline: 0

	theme-prop('border-color', 'fg-muted')
	theme-prop('color', 'fg-muted')

	&:hover
		theme-prop('border-color', 'highlight')
		theme-prop('color', 'highlight')


</style>

<script lang="ts" src="./add-widget"></script>
