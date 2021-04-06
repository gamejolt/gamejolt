<script lang="ts" src="./communities"></script>

<template>
	<div class="container-xl">
		<div class="text-center">
			<h2 class="section-header">
				<translate>Browse Communities</translate>
			</h2>

			<p>
				<translate>
					Find a community to create and explore fanart, videos, walkthroughs and more!
				</translate>
			</p>

			<hr class="underbar underbar-center" />
			<br />
		</div>

		<div class="row">
			<div
				v-for="community of slicedCommunities"
				:key="community.id"
				class="col-xs-6 col-sm-3 col-md-2"
			>
				<app-discover-home-communities-item
					v-app-track-event="`home:communities:click`"
					:community="community"
				/>
			</div>
		</div>

		<br />

		<div class="page-cut">
			<app-button
				v-app-track-event="`home:more-btn:communities`"
				:to="{ name: 'discover.communities' }"
			>
				<translate>Browse More Communities</translate>
			</app-button>
		</div>
	</div>
</template>
