<template>
	<div class="row" v-if="isRouteBootstrapped">
		<div class="col-md-9 col-lg-8">
			<app-sites-manage-page :site="site" />
		</div>
		<div class="col-md-3 col-lg-4">
			<br class="hidden-lg" />

			<p class="page-help">
				<strong>
					<translate>
						Game Jolt Sites are customizable external sites for your portfolio and games!
					</translate>
				</strong>
				<translate>
					You can use a customizable template, or simply upload your own static site.
				</translate>
			</p>

			<p class="page-help">
				<translate>
					Sites don't replace your Game Jolt user profile page. You can use your Site URL to share
					your site with others.
				</translate>
			</p>

			<p class="page-help">
				<translate>You can set up a game site when managing your game.</translate>
			</p>

			<hr />

			<app-sites-link-card :site="site" />
		</div>
	</div>
</template>

<script lang="ts" src="./site" />
