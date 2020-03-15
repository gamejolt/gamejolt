<template>
	<div>
		<div class="container">
			<div class="row">
				<div class="col-sm-10 col-md-8 col-lg-6 col-centered">
					<h1><translate>Discover Grandiose Communities</translate></h1>
					<p class="help-block">
						<translate>
							Nobody can commune like us. We have the best communities. Join some.
						</translate>
					</p>

					<input
						type="text"
						class="form-control -search"
						placeholder="find stuff"
						v-model="searchText"
					/>

					<div class="-bottom"></div>
				</div>
			</div>

			<div class="row">
				<app-loading v-if="isLoading" centered />
				<template v-else-if="communities.length">
					<div
						class="-item col-sm-6 col-md-4 col-lg-3 anim-fade-in"
						v-for="community of communities"
						:key="community.id"
					>
						<app-community-card :community="community" />
					</div>
					<app-loading v-if="isLoadingMore" class="-loading-more" centered />
				</template>
				<div v-else class="col-sm-10 col-md-8 col-lg-6 col-centered">
					<div class="alert alert-notice anim-fade-in">
						No communities match your search.
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.-search
	margin: ($line-height-computed * 2) 0

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

.-loading-more
	clear: both

</style>

<script lang="ts" src="./communities"></script>
