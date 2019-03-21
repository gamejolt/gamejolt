<template>
	<section class="container" v-if="isRouteBootstrapped">
		<div class="game-cover">
			<app-media-item-cover v-if="game.header_media_item" :media-item="game.header_media_item" />
		</div>

		<div class="text-center">
			<h1>
				<a
					class="link-unstyled"
					:href="Environment.baseUrl + `/games/${game.slug}/${game.id}`"
					target="_blank"
				>
					{{ game.title }}
				</a>
			</h1>
			<h4>
				<translate>by</translate>
				<a
					class="link-unstyled"
					:href="Environment.baseUrl + `/profile/${game.developer.slug}/${game.developer.id}`"
				>
					{{ game.developer.display_name }}
				</a>
			</h4>
		</div>
		<br />

		<form-payment :cards="cards" :order="order" @submit="onSubmit" />
	</section>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.game-cover
	margin-top: -($grid-gutter-width / 2)
	margin-right: -($grid-gutter-width-xs / 2)
	margin-left: -($grid-gutter-width-xs / 2)

	@media $media-sm-up
		margin-right: -($grid-gutter-width / 2)
		margin-left: -($grid-gutter-width / 2)

h1
	margin-top: $line-height-computed * 2
	margin-bottom: 0

h4
	theme-prop('color', 'fg-muted')
	margin-top: 0
	margin-bottom: $line-height-computed
	font-family: $font-family-base
</style>

<script lang="ts" src="./checkout" />
