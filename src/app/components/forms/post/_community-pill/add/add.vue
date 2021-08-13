<script lang="ts" src="./add"></script>

<template>
	<app-form-post-community-pill-selector :communities="communities" @select="emitAdd">
		<app-pill class="-add">
			<template #img>
				<app-jolticon icon="add" />
			</template>
			<translate>Add Community</translate>
		</app-pill>
	</app-form-post-community-pill-selector>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '../variables'

.-add
	cursor: pointer
	height: $pill-height
	border: $border-width-base solid var(--theme-bg-subtle)
	transition: border-color 300ms $strong-ease-out

	&:hover
		border-color: var(--theme-link-hover)
</style>
