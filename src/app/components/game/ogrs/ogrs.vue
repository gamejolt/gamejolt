<template>
	<div class="clearfix">
		<div
			class="game-ogrs clearfix"
			v-if="game.tigrs_age > 0"
			:class="{
				'has-descriptors': !hideDescriptors && descriptors.length,
				'no-descriptors': !descriptors.length,
				'hide-tag': hideTag,
			}"
		>
			<app-game-ogrs-tag v-if="!hideTag" full :game="game" />

			<div class="game-ogrs-descriptors" v-if="!hideDescriptors && descriptors.length">
				<div class="game-ogrs-descriptor" v-for="descriptor of descriptors">
					{{ descriptor }}
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.game-ogrs
	rounded-corners-lg()
	margin-bottom: $font-size-base
	border: 4px solid $black
	background: $black

	&.no-descriptors
		float: left

	// Make sure we override the tag.styl file no matter the order of imports.
	&-tag
		float: left
		border: 0 !important

	&-descriptors
		margin-left: 80px
		padding: 10px
		border-left: 4px solid $black
		background: $white
		border-top-right-radius: $border-radius-large
		border-bottom-right-radius: $border-radius-large
		min-height: 114px

		.game-ogrs.hide-tag &
			margin-left: 0
			border-left: 0

	&-descriptor
		margin: 0 0 0.5em 0
		font-family: $font-family-tiny
		font-weight: bold
		font-size: $font-size-small
		line-height: 1
		color: $black
</style>

<script lang="ts" src="./ogrs"></script>
