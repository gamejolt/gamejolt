<template>
	<app-form-post-community-pill-selector :communities="communities" @select="emitAdd">
		<app-pill-bi no-hover class="-pill">
			<div slot="img" class="-pill-img" />

			<span slot="left" class="-pill-placeholder" style="margin-left: 2px"></span>
			<span slot="right" class="-pill-placeholder"></span>
		</app-pill-bi>
	</app-form-post-community-pill-selector>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-pill
	// border: 1px solid var(--theme-fg)

	&:hover
		cursor: pointer
		border-color: var(--theme-highlight)

.-pill-img
	height: 100%
	background-color: var(--theme-bg-subtle)

.-pill-placeholder
	lazy-placeholder-inline()
	width: 30px
	height: 8px
</style>

<script lang="ts" src="./add"></script>
