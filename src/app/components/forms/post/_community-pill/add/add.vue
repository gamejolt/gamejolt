<template>
	<app-form-post-community-pill-selector :communities="communities" @select="emitAdd">
		<app-pill class="-add">
			<app-jolticon slot="img" icon="add" />
			Add Community
		</app-pill>
	</app-form-post-community-pill-selector>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-add
	cursor: pointer
	height: 28px
	border: 1.5px solid var(--theme-bg-subtle)
	transition: border-color 300ms $strong-ease-out

	&:hover
		border-color: var(--theme-link-hover)
</style>

<script lang="ts" src="./add"></script>
