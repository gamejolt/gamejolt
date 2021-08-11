<script lang="ts" src="./game-cover-buttons"></script>

<template>
	<div class="client-game-cover-buttons">
		<!--
			For Client we hide this once they start installing a package or if they have something
			installed.
		-->
		<app-button
			v-if="browserBuilds.length > 0 && !localPackage"
			primary
			outline
			icon="play"
			@click="emitPlay()"
		>
			<translate>Quick Play</translate>
		</app-button>

		<!--
			Only show if there is any downloadable builds for the game. The component will show a
			tooltip saying it can't be installed for their platform if there's not an installable build.
		-->
		<app-client-game-buttons
			v-if="downloadableBuilds.length > 0"
			label="game-cover"
			:game="game"
			:can-install="installableBuilds.length > 0"
			no-progress
		/>
	</div>
</template>
