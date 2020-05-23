<template>
	<app-form-post-community-pill-selector :communities="communities" @select="emitAdd">
		<app-button icon="add" sm trans>
			Add Community
		</app-button>
	</app-form-post-community-pill-selector>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.button
	color: var(--theme-fg-muted)
	font-weight: bold
</style>

<script lang="ts" src="./add"></script>
