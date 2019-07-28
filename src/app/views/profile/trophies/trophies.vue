<template>
	<section class="section fill-backdrop">
		<div class="container">
			<div class="row">
				<div class="-item col-sm-6 col-md-4 col-lg-3" v-for="trophy of trophies" :key="trophy.id">
					<app-trophy-card :trophy="trophy" />
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

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
