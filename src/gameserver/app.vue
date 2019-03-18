<template>
	<div
		v-if="build"
		class="-build-embed fill-darker -shell-padding"
		:style="{
			width: embedWidthStyle,
			height: embedHeightStyle,
		}"
	>
		<app-theme />

		<app-embed-flash v-if="build.type === GameBuild.TYPE_FLASH" />
		<app-embed-html v-if="build.type === GameBuild.TYPE_HTML" />
		<app-embed-unity v-if="build.type === GameBuild.TYPE_UNITY" />
		<app-embed-silverlight v-if="build.type === GameBuild.TYPE_SILVERLIGHT" />
		<app-embed-applet v-if="build.type === GameBuild.TYPE_APPLET" />
		<app-embed-rom v-if="build.type === GameBuild.TYPE_ROM" />
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-build-embed
	margin: 0
	padding: 0
	display: flex

	// This fixes issues where they don't set a body bg color.
	// https://github.com/gamejolt/next-issue-tracker/issues/241
	> iframe
		margin: 0
		padding: 0
		background-color: $white
		border: 0
</style>

<script lang="ts" src="./app" />
