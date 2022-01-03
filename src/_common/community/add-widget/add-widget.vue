<script lang="ts" src="./add-widget"></script>

<template>
	<router-link
		v-if="canCreate"
		v-app-tooltip="tooltip"
		class="-add"
		:to="{ name: 'dash.communities.add' }"
	>
		<app-jolticon icon="add" big />
	</router-link>
	<a
		v-else
		v-app-auth-required
		v-app-tooltip="tooltip"
		class="-add"
		:class="{ '-disabled': user }"
		@click="showGrowl"
	>
		<app-jolticon icon="add" big />
	</a>
</template>

<style lang="stylus" scoped>
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
