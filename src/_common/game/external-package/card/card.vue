<script lang="ts" src="./card"></script>

<template>
	<app-card :id="`game-external-package-card-${package.id}`" class="game-external-package-card">
		<div class="card-title">
			<h4>
				{{ package.title }}
			</h4>
		</div>

		<div v-if="platforms.length" class="card-meta card-meta-sm">
			<app-jolticon
				v-for="platform of platforms"
				:key="platform"
				v-app-tooltip="GameBuild.platformSupportInfo[platform].tooltip"
				:icon="GameBuild.platformSupportInfo[platform].icon"
			/>
		</div>

		<div v-if="package.description" class="card-content">
			<app-fade-collapse
				:collapse-height="100"
				:is-open="showFullDescription"
				@require-change="canToggleDescription = $event"
				@expand="showFullDescription = true"
			>
				<div>{{ package.description }}</div>
			</app-fade-collapse>

			<a
				v-if="canToggleDescription"
				v-app-track-event="`game-package-card:show-full-description`"
				class="hidden-text-expander"
				@click="showFullDescription = !showFullDescription"
			/>
		</div>

		<div class="card-controls">
			<app-button
				v-app-tooltip="$gettext(`Play Off-Site`)"
				primary
				icon="world"
				@click="gotoExternal()"
			>
				<translate>Play</translate>
			</app-button>
		</div>
	</app-card>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.game-external-package-card
	.card
		padding-bottom: 0

	.card-controls
		margin-bottom: 10px

		small
			margin-left: 5px
</style>
