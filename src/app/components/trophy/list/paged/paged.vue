<script lang="ts" src="./paged"></script>

<template>
	<div>
		<div v-if="!trophies.length" class="row">
			<div v-for="i of placeholderCount" :key="i" class="-item col-sm-6 col-md-4 col-lg-4">
				<!-- TODO: Make real placeholder -->
				placeholder
			</div>
		</div>
		<template v-else>
			<div class="row">
				<div
					v-for="trophy of trophies"
					:key="trophy.key"
					class="-item col-sm-6 col-md-4 col-lg-4"
				>
					<app-trophy-card :user-trophy="trophy" />
				</div>
			</div>

			<app-loading v-if="isLoading" centered />
			<div v-else-if="shouldShowLoadMore" class="page-cut">
				<app-button
					v-app-track-event="`profile-trophies:more`"
					trans
					@click="onClickLoadMore()"
				>
					<translate>Load More</translate>
				</app-button>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
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
