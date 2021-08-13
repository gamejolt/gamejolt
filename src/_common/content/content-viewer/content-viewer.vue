<script lang="ts" src="./content-viewer"></script>

<template>
	<div class="content-viewer" :class="viewerStyleClass">
		<app-content-viewer-base-component v-if="doc" :content="doc.content" :owner="owner" />
	</div>
</template>

<style lang="stylus" scoped>
::v-deep(p > code)
	white-space: normal

// Because white space is rendered out in the editor, we want the viewer to get as close to that
// as possible. HTML by default collapses white space, and this overrides that behavior.
::v-deep(p > span)
	white-space: pre-wrap
	white-space: break-spaces
</style>
