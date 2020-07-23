<template>
	<router-link
		v-if="canCreate"
		v-app-tooltip="tooltip"
		class="-add"
		:to="{ name: 'dash.communities.add' }"
	>
		<app-jolticon icon="add" big />
	</router-link>
	<a v-else-if="user" v-app-tooltip="tooltip" class="-add -disabled" @click="showGrowl">
		<app-jolticon icon="add" big />
	</a>
</template>

<script lang="ts" src="./add-widget"></script>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-add
	pressy()
	display: flex
	justify-content: center
	align-items: center
	border: $border-width-large dashed
	border-color: var(--theme-fg-muted)
	color: var(--theme-fg-muted)
	border-radius: 100%
	cursor: pointer
	position: absolute
	width: 100%
	height: 100%
	outline: 0

	&:not(.-disabled):hover
		border-color: var(--theme-link)
		color: var(--theme-link)

.-disabled
	unpressy()
	cursor: not-allowed

	> *
		pointer-events: none
</style>
