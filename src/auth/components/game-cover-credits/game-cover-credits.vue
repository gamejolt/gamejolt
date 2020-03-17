<template>
	<router-link
		v-if="coverGame"
		class="game-cover-credits link-unstyled"
		:to="coverGame.getUrl()"
		:title="coverGame.title"
		v-app-track-event="`auth-game-cover-credits:click`"
		target="_blank"
	>
		<div class="-container">
			<div class="-col">
				<div class="-title">
					{{ coverGame.title }}
				</div>
				<div class="-dev text-muted">
					<translate>by</translate>
					<strong>{{ coverGame.developer.display_name }}</strong>
				</div>
				<div class="-followers text-muted">
					<translate
						:translate-n="coverGame.follower_count || 0"
						:translate-params="{ count: number(coverGame.follower_count || 0) }"
						translate-plural="%{ count } followers"
					>
						%{ count } follower
					</translate>
				</div>
			</div>
			<div class="-img">
				<app-game-thumbnail-img :game="coverGame" />
			</div>
		</div>
	</router-link>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$-image-width = 120px
$-spacing = 8px
$-padding = 8px
$-width = 320px

.game-cover-credits
	rounded-corners()
	display: block
	padding: $-padding
	background-color: rgba($black, 0.4)

.-container
	display: flex
	max-width: $-width

a
	width: fit-content

a:hover
	border-bottom: none !important
	background-color: rgba($black, 0.8)

.-img
	width: $-image-width
	margin-left: $-spacing
	flex: none

.-title
	font-weight: 700

.-dev
	font-size: $font-size-small

.-followers
	font-size: $font-size-small

.-col
	display: flex
	flex-flow: column nowrap
	justify-content: space-between
	align-items: flex-end

	> *
		display: block
		text-overflow()
		max-width: $-width - ($-image-width + $-spacing)
</style>

<script lang="ts" src="./game-cover-credits"></script>
