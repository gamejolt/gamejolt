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

>>> .emoji
	image-rendering: pixelated
</style>

<script lang="ts" src="./content-viewer"></script>
