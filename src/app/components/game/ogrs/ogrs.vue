<script lang="ts" src="./ogrs"></script>

<template>
	<div class="clearfix">
		<div
			v-if="game.tigrs_age > 0"
			class="game-ogrs clearfix"
			:class="{
				'has-descriptors': !hideDescriptors && descriptors.length,
				'no-descriptors': !descriptors.length,
				'hide-tag': hideTag,
			}"
		>
			<app-game-ogrs-tag v-if="!hideTag" full :game="game" />

			<div v-if="!hideDescriptors && descriptors.length" class="game-ogrs-descriptors">
				<div
					v-for="descriptor of descriptors"
					:key="descriptor"
					class="game-ogrs-descriptor"
				>
					{{ descriptor }}
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.game-ogrs
	rounded-corners()
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
		border-top-right-radius: $border-radius-base - 1px
		border-bottom-right-radius: $border-radius-base - 1px
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
