<template>
	<canvas
		id="emulator-target"
		style="display: block; margin: 0 auto; padding: 0;"
		:style="{
			width: `${build.embed_width}px`,
			height: `${build.embed_height}px`,
		}"
	/>
</template>

<script lang="ts" src="./rom" />
