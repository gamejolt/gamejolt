<script lang="ts" src="./recommendations"></script>

<template>
	<div class="post-page-recommendations">
		<h4 class="section-header">
			<translate>Next up</translate>
		</h4>
		<div class="-posts">
			<template v-if="!posts">
				<div v-for="i of 4" :key="i" class="-post">
					<app-post-card-placeholder />
				</div>
			</template>
			<template v-else>
				<div v-for="recommendedPost of posts" :key="recommendedPost.id" class="-post">
					<app-post-card :post="recommendedPost" with-user />
				</div>
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.post-page-recommendations
	@media $media-lg-up
		margin-left: 50px

	.-posts
		display: grid
		grid-template-columns: repeat(auto-fill, minmax(max(50%, 120px), 1fr))
		grid-gap: 16px
</style>
