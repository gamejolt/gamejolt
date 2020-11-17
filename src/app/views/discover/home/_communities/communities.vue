<script lang="ts" src="./communities"></script>

<template>
	<div>
		<h2 class="section-header sans-margin-bottom">
			<translate>Communities</translate>
		</h2>

		<p class="text-muted">
			<translate>
				Join a community to create and explore fanart, videos, game guides and more!
			</translate>
		</p>

		<template v-if="app.user">
			<app-community-slider-placeholder v-if="isLoading" :num="10" with-add-button />
			<app-community-slider
				v-else-if="communities.length"
				:communities="communities"
				with-add-button
				event-cat="home"
			/>
		</template>
		<template v-else>
			<div class="-communities-list">
				<app-discover-home-communities-item
					v-for="community of communities"
					:key="community.id"
					:community="community"
				/>

				<div class="-item">
					<app-community-discover-widget />
				</div>
				<div class="-item">
					<app-community-add-widget />
				</div>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import './common.styl'

.-communities-list
	display: flex
	flex-wrap: wrap
	justify-content: center

.-item
	position: relative
	// Undoes pressy()
	transition: none !important
	transform: none !important

	>>>
		.jolticon
			@media $media-lg
				font-size: 92px

			@media $media-md
				font-size: 72px

			@media $media-sm
				font-size: 48px
</style>
