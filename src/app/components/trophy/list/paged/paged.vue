<template>
	<div class="container">
		<div class="row" v-if="!trophies.length">
			<div class="-item col-sm-6 col-md-4 col-lg-4" v-for="i of placeholderCount" :key="i">
				<!-- TODO: Make real placeholder -->
				placeholder
			</div>
		</div>
		<template v-else>
			<div class="row">
				<div class="-item col-sm-6 col-md-4 col-lg-4" v-for="trophy of trophies" :key="trophy.key">
					<app-trophy-card :user-trophy="trophy" />
				</div>
			</div>

			<app-loading v-if="isLoading" centered />
			<div class="page-cut" v-else-if="shouldShowLoadMore">
				<app-button trans @click="loadMore()" v-app-track-event="`profile-trophies:more`">
					<translate>Load More</translate>
				</app-button>
			</div>
		</template>
	</div>
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
		&:nth-child(3n+1)
			clear: both
</style>

<script lang="ts" src="./paged"></script>
