<script lang="ts" src="./installed"></script>

<template>
	<div>
		<app-page-header>
			<h1><translate>library.installed.heading</translate></h1>
			<br />
		</app-page-header>

		<section class="section">
			<div class="container">
				<app-alert-dismissable alert-type="info" dismiss-key="library.install-location-msg">
					<app-jolticon icon="info-circle" />
					<translate
						translate-comment="Short message to remind them that they can change install location at any time in their settings."
					>
						You can change the location where games are installed at any time in your
						settings.
					</translate>
					<router-link :to="{ name: 'settings' }">
						<translate>Go to Settings?</translate>
					</router-link>
				</app-alert-dismissable>

				<div v-if="!games.length" class="alert alert-notice">
					<translate
						translate-comment="The message shown when there are no games installed yet in their library."
					>
						Your installed games show up here... that is, once you have some!
					</translate>
				</div>
				<div v-else class="row">
					<div v-for="game of gamesByTitle" :key="game.id" class="col-md-6 col-lg-4">
						<app-library-installed-game :game="game" />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
