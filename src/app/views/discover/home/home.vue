
<script lang="ts" src="./home"></script>

<template>
	<div>
		<app-discover-home-banner :is-loading="!isRouteBootstrapped" :item="featuredItem" />

		<app-discover-home-tags />

		<template v-if="isRouteBootstrapped">
			<section class="section fill-backdrop">
				<div class="container-xl">
					<app-discover-home-communities :communities="featuredCommunities" />
					<!-- :is-loading="!isRouteBootstrapped" -->

					<template v-if="!isInSplit">
						<h2>
							<translate>Featured Games</translate>
						</h2>
						<p>
							<translate>
								Check these games out and follow along in their development!
							</translate>
						</p>

						<!-- <app-game-grid-placeholder v-if="!isRouteBootstrapped" :num="6" /> -->
						<app-game-grid :games="games" truncate-to-fit event-label="home" />

						<div class="page-cut">
							<app-button
								v-app-track-event="`home:more-btn:browse`"
								trans
								:to="{
									name: 'discover.games.list._fetch',
									params: { section: null },
								}"
							>
								<translate>More Games</translate>
							</app-button>
						</div>
					</template>
				</div>
			</section>

			<section v-if="!app.user" class="section fill-offset">
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
		</template>
		<template v-else>
			<section class="section">
				<app-loading hide-label centered />
			</section>
		</template>
	</div>
</template>
