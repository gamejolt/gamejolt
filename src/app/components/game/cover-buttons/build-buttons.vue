<script lang="ts" src="./build-buttons"></script>

<template>
	<div>
		<app-button v-if="browserBuilds.length" primary solid icon="play" @click="emitPlay()">
			<translate>Play Game</translate>
		</app-button>

		<app-button
			v-if="downloadableBuilds.length"
			primary
			:solid="!browserBuilds.length"
			icon="download"
			@click="emitDownload()"
		>
			<translate>Download</translate>
		</app-button>
	</div>
</template>
