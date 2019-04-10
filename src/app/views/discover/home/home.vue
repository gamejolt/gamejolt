<template>
	<div>
		<app-discover-home-banner v-if="featuredItem" :item="featuredItem" />

		<app-discover-home-tags />

		<section class="section">
			<div class="container-xl">
				<app-discover-home-communities
					v-if="featuredCommunities.length > 0"
					:communities="featuredCommunities"
				/>

				<h2 class="sans-margin-bottom">
					<translate>Featured Games</translate>
				</h2>
				<p class="text-muted">
					<translate>Check these games out and follow along in their development!</translate>
				</p>

				<app-game-grid-placeholder v-if="!isRouteBootstrapped" :num="6" />
				<app-game-grid v-else :games="games" truncate-to-fit event-label="home" />

				<div class="page-cut">
					<app-button
						trans
						:to="{
							name: 'discover.games.list._fetch',
							params: { section: null },
						}"
						v-app-track-event="`home:more-btn:browse`"
					>
						<translate>Browse More Games</translate>
					</app-button>
				</div>
			</div>
		</section>

		<section class="section fill-offset" v-if="isRouteBootstrapped && !app.user">
			<div class="container">
				<h2 class="section-header text-center">
					<translate>Join Game Jolt</translate>
				</h2>

				<div class="text-center">
					<p class="lead">
						<translate>Do you love games as much as we do?</translate>
					</p>
				</div>

				<hr class="underbar underbar-center" />
				<br />

				<div class="row">
					<div class="col-sm-6 col-md-5 col-lg-4 col-centered">
						<app-auth-join />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script lang="ts" src="./home"></script>
