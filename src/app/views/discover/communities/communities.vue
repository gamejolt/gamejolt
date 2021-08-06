<script lang="ts" src="./communities"></script>

<template>
	<section class="section fill-backdrop">
		<div class="container">
			<h1 class="text-center">
				<translate>Browse Communities</translate>
			</h1>

			<br />
			<br />

			<app-loading v-if="isLoadingFirst" centered />
			<template v-else>
				<div class="row">
					<div
						v-for="community of communities"
						:key="community.id"
						class="-item col-sm-6 col-md-4 col-lg-3 anim-fade-in"
					>
						<app-community-card :community="community" elevate />
					</div>
				</div>

				<template v-if="hasMore">
					<app-scroll-inview
						v-if="!isLoadingMore"
						:config="inviewConfig"
						@inview="loadMore()"
					/>
					<app-loading v-else class="-loading-more" centered />
				</template>
			</template>

			<div v-if="showCreateCommunity" class="row -create">
				<div class="page-cut" />

				<h2 class="-lead text-center">
					<translate>Can't find your dream community?</translate>
				</h2>

				<app-community-card-create-placeholder style="margin: 0 auto" />
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-item
	margin-bottom: $line-height-computed * 1.5

	@media $media-sm
		&:nth-child(2n+1)
			clear: both

	@media $media-md
		&:nth-child(3n+1)
			clear: both

	@media $media-lg
		&:nth-child(4n+1)
			clear: both

.-loading-more
	clear: both

.-create
	.-lead
		margin: $line-height-computed 0
</style>
