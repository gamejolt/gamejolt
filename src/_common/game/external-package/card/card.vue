<template>
	<app-card class="game-external-package-card" :id="`game-external-package-card-${package.id}`">
		<div class="card-title">
			<h4>
				{{ package.title }}
			</h4>
		</div>

		<div class="card-meta card-meta-sm" v-if="platforms.length">
			<app-jolticon
				v-for="platform of platforms"
				:key="platform"
				:icon="GameBuild.platformSupportInfo[platform].icon"
				v-app-tooltip="GameBuild.platformSupportInfo[platform].tooltip"
			/>
		</div>

		<div class="card-content" v-if="package.description">
			<app-fade-collapse
				:collapse-height="100"
				:is-open="showFullDescription"
				@require-change="canToggleDescription = $event"
				@expand="showFullDescription = true"
			>
				<div v-html="package.description" />
			</app-fade-collapse>

			<a
				class="hidden-text-expander"
				v-if="canToggleDescription"
				@click="showFullDescription = !showFullDescription"
				v-app-track-event="`game-package-card:show-full-description`"
			/>
		</div>

		<div class="card-controls">
			<app-button
				primary
				icon="world"
				@click="gotoExternal()"
				v-app-tooltip="$gettext(`Play Off-Site`)"
			>
				<translate>Play</translate>
			</app-button>
		</div>
	</app-card>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.game-external-package-card
	.card
		padding-bottom: 0

	.card-controls
		margin-bottom: 10px

		small
			margin-left: 5px
</style>

<script lang="ts" src="./card"></script>
