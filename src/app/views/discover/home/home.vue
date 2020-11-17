
<script lang="ts" src="./home"></script>

<template>
	<div>
		<app-discover-home-banner :is-loading="!isRouteBootstrapped" :item="featuredItem" />

		<app-discover-home-tags />

		<section class="section">
			<div class="container-xl">
				<app-discover-home-communities
					:is-loading="!isRouteBootstrapped"
					:communities="featuredCommunities"
				/>

				<template v-if="app.user">
					<h2 class="sans-margin-bottom">
						<translate>Featured Games</translate>
					</h2>
					<p class="text-muted">
						<translate>
							Check these games out and follow along in their development!
						</translate>
					</p>

					<app-game-grid-placeholder v-if="!isRouteBootstrapped" :num="6" />
					<app-game-grid v-else :games="games" truncate-to-fit event-label="home" />

					<div class="page-cut">
						<app-button
							v-app-track-event="`home:more-btn:browse`"
							trans
							:to="{
								name: 'discover.games.list._fetch',
								params: { section: null },
							}"
						>
							<translate>Browse More Games</translate>
						</app-button>
					</div>
				</template>
			</div>
		</section>

		<section v-if="isRouteBootstrapped && !app.user" class="section fill-offset">
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
