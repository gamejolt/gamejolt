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
	border: 3px solid
	border-radius: 100%
	cursor: pointer
	position: absolute
	width: 100%
	height: 100%
	outline: 0

	theme-prop('border-color', 'gray-subtle')
	theme-prop('color', 'gray-subtle')


</style>

<script lang="ts" src="./add-widget"></script>
