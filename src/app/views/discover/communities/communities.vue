<script lang="ts" src="./communities"></script>

<template>
	<section class="section fill-backdrop">
		<div class="container">
			<div class="row">
				<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
					<h1 class="text-center">
						<translate>Browse Communities</translate>
					</h1>

					<div class="-search">
						<input
							v-model="searchText"
							type="text"
							class="form-control"
							:placeholder="$gettext(`Search...`)"
						/>
						<app-jolticon
							v-if="searchText"
							icon="remove"
							class="text-muted"
							@click.native="clearSearch"
						/>
					</div>
				</div>
			</div>

			<app-loading v-if="isLoadingFirst" centered />
			<template v-else-if="communities.length">
				<div class="row">
					<div
						v-for="community of communities"
						:key="community.id"
						class="-item col-sm-6 col-md-4 col-lg-3 anim-fade-in"
					>
						<app-community-card :community="community" elevate />
					</div>
				</div>

				<app-scroll-inview
					:config="InviewConfigLoadMore"
					:controller="loadMoreInviewController"
					@inview="onScrollLoadMore"
				>
					<app-loading v-if="isLoadingMore" class="-loading-more" centered />
				</app-scroll-inview>
			</template>
			<template v-else>
				<div class="row">
					<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
						<div class="alert alert-notice anim-fade-in">
							No communities match your search.
						</div>
					</div>
				</div>
			</template>

			<div v-if="showCreateCommunity" class="row -create">
				<div class="page-cut" />

				<h2 class="-lead text-center">
					<translate>Can't find your dream community?</translate>
				</h2>

				<app-community-card-create-placeholder style="margin: 0 auto;" />
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-search
	margin: ($line-height-computed * 2) 0
	position: relative

	input
		width: 100%

	.jolticon
		position: absolute
		top: 9px
		right: 5px

		&:hover
			cursor: pointer

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
