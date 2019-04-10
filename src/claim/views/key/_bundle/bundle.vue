<template>
	<div>
		<div class="alert full-bleed full-bleed-xs text-center" v-if="!app.user">
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
			<div class="col-sm-6" v-for="game of games" :key="game.id">
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

<script lang="ts" src="./bundle"></script>
