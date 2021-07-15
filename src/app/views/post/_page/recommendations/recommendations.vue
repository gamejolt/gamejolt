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
	max-width: 250px
	margin-left: 50px

	.-posts
		margin-left: -8px
		margin-right: -8px

	.-post
		float: left
		// width: 50%
		width: 100%
		padding-bottom: $line-height-computed
		padding-left: 8px
		padding-right: 8px
</style>
