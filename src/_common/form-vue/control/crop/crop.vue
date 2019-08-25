<template>
	<app-img-crop
		:id="id"
		:src="src"
		:aspect-ratio="aspectRatio"
		:min-aspect-ratio="minAspectRatio"
		:max-aspect-ratio="maxAspectRatio"
		:min-width="minWidth"
		:min-height="minHeight"
		:max-width="maxWidth"
		:max-height="maxHeight"
		:disabled="disabled"
		:value="controlVal"
		@input="onChange"
	/>
</template>

<script lang="ts" src="./crop"></script>
