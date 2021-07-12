<script lang="ts" src="./recommendations"></script>

<template>
	<div class="post-page-recommendations">
		<h3>
			<translate>Recommended</translate>
		</h3>
		<template v-if="posts">
			<app-post-card
				v-for="recommendedPost of posts"
				:key="recommendedPost.id"
				:post="recommendedPost"
				with-user
				flat
			/>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.post-page-recommendations
	max-width: 300px
	margin-left: 20px
	margin-right: 20px

	& > div
		display: inline-block
		width: 100%
		max-width: 130px
		margin-left: 10px
		margin-right: 10px
		margin-bottom: 20px

		@media $media-md-down
			max-width: 100px
</style>
