<script lang="ts" src="./app"></script>

<template>
	<div
		class="shell"
		:class="{
			'theme-dark fill-darker': !isLightTheme,
			'theme-light': isLightTheme,
			'is-loaded': isLoaded,
			'has-invalid-key-error': hasInvalidKey,
		}"
	>
		<app-theme />

		<div v-if="hasInvalidKey" class="alert alert-notice text-center">
			<app-jolticon icon="notice" />
			Invalid widget key.
		</div>

		<app-processing-overlay v-if="isProcessing" />

		<transition name="slide-up">
			<app-toast v-if="hasFailure === 'setup-order'" type="error" @dismiss="clearFailure()">
				Something went wrong!
			</app-toast>
		</transition>

		<div v-if="isLoaded">
			<app-game-header />
			<component :is="view" />
		</div>

		<app-footer />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.shell
	rounded-corners()
	padding: $shell-padding
	position: relative
	height: $shell-height - $pricing-card-offset

.theme-light
	theme-prop('background-color', 'bg-offset')
</style>

