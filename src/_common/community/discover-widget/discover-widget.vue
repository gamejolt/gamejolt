<template>
	<router-link class="-discover" :to="{ name: 'discover.communities' }" v-app-tooltip="tooltip">
		<app-jolticon icon="search" />
	</router-link>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-discover
	pressy()
	display: flex
	justify-content: center
	align-items: center
	border: $border-width-base dashed
	border-radius: 100%
	cursor: pointer
	position: absolute
	width: 100%
	height: 100%
	outline: 0

	border-color: var(--theme-fg-muted)
	color: var(--theme-fg-muted)

	&:hover
			border-color: var(--theme-highlight)
			color: var(--theme-highlight)

.jolticon
	margin: 0 3px
	font-size: $jolticon-size * 1.5
</style>

<script lang="ts" src="./discover-widget"></script>
