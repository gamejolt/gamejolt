<template>
	<div>
		<app-button v-if="browserBuilds.length" primary solid icon="play" @click="$emit('play')">
			<translate>Play Game</translate>
		</app-button>

		<app-button
			v-if="downloadableBuilds.length"
			primary
			:solid="!browserBuilds.length"
			icon="download"
			@click="$emit('download')"
		>
			<translate>Download</translate>
		</app-button>
	</div>
</template>

<script lang="ts" src="./build-buttons"></script>
