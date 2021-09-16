
<script lang="ts" src="./home"></script>

<template>
	<div>
		<!-- TODO: We should be checking if the Fireside is actually expired or not. -->
		<app-fireside-stream-banner v-if="shouldShowFiresideBanner" :fireside="fireside" />
		<app-discover-home-banner v-else :is-loading="!isRouteBootstrapped" :item="featuredItem" />

		<section class="section fill-backdrop">
			<app-discover-home-communities
				:is-loading="!isRouteBootstrapped"
				:communities="featuredCommunities"
			/>
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
	</div>
</template>
