<template>
	<section class="section fill-backdrop">
		<div class="container">
			<app-user-level-widget class="-level-widget" :user="user" />

			<div v-if="trophies.length === 0" class="well fill-offset">
				<translate>This user has not achieved any trophies ... yet!</translate>
			</div>

			<div class="row">
				<div class="-item col-sm-6 col-md-4 col-lg-3" v-for="trophy of trophies" :key="trophy.key">
					<app-trophy-card :user-trophy="trophy" />
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-level-widget
	max-width: 340px

.-item
	@media $media-sm
		&:nth-child(2n+1)
			clear: both

	@media $media-md
		&:nth-child(3n+1)
			clear: both

	@media $media-lg
		&:nth-child(4n+1)
			clear: both
</style>

<script lang="ts" src="./trophies"></script>
