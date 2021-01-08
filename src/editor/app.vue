<script lang="ts" src="./app"></script>

<template>
	<div id="editor">
		<app-theme />

		<app-content-editor
			ref="editor"
			embedded
			:value="content"
			:content-context="'fireside-post-article'"
			@input="onUpdate"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
</style>
