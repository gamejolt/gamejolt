<template>
	<div class="-container">
		<div class="-content">
			<slot />
		</div>
		<div class="-sidebar" v-if="Screen.isLg">
			<slot name="sidebar" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$-gutter = $grid-gutter-width / 2

.-container
	display: flex
	justify-content: center
	padding: $grid-gutter-width 0

.-content, .-sidebar
	margin-left: $-gutter
	margin-right: $-gutter

.-content
	flex: 2 1
	max-width: 650px

.-sidebar
	flex: 1 2
	max-width: var(--route-communities-view-sidebar-width)
</style>

<script lang="ts" src="./page-container"></script>
