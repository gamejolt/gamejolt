<template>
	<router-link
		v-if="canCreate"
		class="-add"
		:to="{ name: 'dash.communities.add' }"
		v-app-tooltip="tooltip"
	>
		<app-jolticon icon="add" big />
	</router-link>
	<a v-else class="-add -disabled" v-app-tooltip="tooltip" @click="showGrowl">
		<app-jolticon icon="add" big />
	</a>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-add
	pressy()
	display: flex
	justify-content: center
	align-items: center
	border: $border-width-base dashed
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

<script lang="ts" src="./add-widget"></script>
