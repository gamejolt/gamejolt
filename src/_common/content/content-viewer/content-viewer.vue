<script lang="ts" src="./content-viewer"></script>

<template>
	<div class="content-viewer" :class="viewerStyleClass">
		<app-content-viewer-base-component
			v-if="shouldShowContent"
			:content="data.content"
			:owner="owner"
		/>
	</div>
</template>

<style lang="stylus" scoped>
>>> p > code
	white-space: normal

// Because white space is rendered out in the editor, we want the viewer to get as close to that
// as possible. HTML by default collapses white space, and this overrides that behavior.
>>> p > span
	white-space: pre-wrap
	white-space: break-spaces
</style>
