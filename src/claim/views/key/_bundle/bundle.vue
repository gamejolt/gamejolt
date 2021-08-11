<script lang="ts" src="./bundle"></script>

<template>
	<div>
		<div v-if="!app.user" class="alert full-bleed full-bleed-xs text-center">
			<p>
				<a :href="loginUrl">
					<translate>
						Sign in to Game Jolt to be able to claim this bundle into your Library.
					</translate>
				</a>
			</p>
		</div>

		<p v-if="app.user">
			<app-button primary block @click="claim(bundle)">
				<translate>Claim Bundle into Library</translate>
			</app-button>
		</p>

		<h1 class="section-header">{{ bundle.title }}</h1>
		<p>{{ bundle.description }}</p>

		<h3>
			<translate>Games in Bundle</translate>
		</h3>

		<div class="row">
			<div v-for="game of games" :key="game.id" class="col-sm-6">
				<app-game-thumbnail
					:game="game"
					:link-to="
						$router.resolve({
							name: 'key',
							params: { accessKey: accessKey },
							query: { bundleGameId: game.id },
						}).href
					"
					:hide-pricing="true"
				/>
			</div>
		</div>
	</div>
</template>
