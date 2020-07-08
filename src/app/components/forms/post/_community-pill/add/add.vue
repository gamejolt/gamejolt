<template>
	<app-form-post-community-pill-selector :communities="communities" @select="emitAdd">
		<app-pill class="-add">
			<app-jolticon slot="img" icon="add" />
			<translate>Add Community</translate>
		</app-pill>
	</app-form-post-community-pill-selector>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '../variables.styl'

.-add
	cursor: pointer
	height: $pill-height
	border: $border-width-base solid var(--theme-bg-subtle)
	transition: border-color 300ms $strong-ease-out

	&:hover
		border-color: var(--theme-link-hover)
</style>

<script lang="ts" src="./add"></script>
