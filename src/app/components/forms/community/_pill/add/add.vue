<script lang="ts" src="./add"></script>

<template>
	<app-forms-community-pill-selector
		:communities="communities"
		:with-channel="withChannel"
		@select="emitAdd"
		@select-community="emitAddCommunity"
	>
		<app-pill class="-add">
			<app-jolticon slot="img" icon="add" />
			<translate>Add Community</translate>
		</app-pill>
	</app-forms-community-pill-selector>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '../variables.styl'

.-add
	cursor: pointer
	height: $pill-height
	border: $border-width-base solid var(--theme-bg-subtle)
	transition: border-color 300ms $strong-ease-out

	&:hover
		border-color: var(--theme-link-hover)
</style>
