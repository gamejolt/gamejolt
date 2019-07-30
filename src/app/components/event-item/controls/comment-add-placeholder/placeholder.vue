<template>
	<div class="form-control -container" @click="onClick('')">
		<div class="-placeholder">
			<em>Leave a comment...</em>
			<div class="-controls" @click.stop>
				<app-jolticon
					class="-gif"
					icon="gif"
					v-app-tooltip="$gettext('Insert Gif')"
					@click.native="onClick('gif')"
				/>
				<span
					:class="'emoji-button emoji emoji-' + emoji"
					v-app-tooltip="$gettext('Insert Emoji')"
					@mouseenter="onMouseEnter"
					@click="onClick('emoji')"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-container
	height: auto
	cursor: text
	position: relative
	theme-prop('color', 'fg-muted')
	change-bg('bg-offset')

.-placeholder
	padding-left: 4px
	white-space: nowrap
	padding-bottom: ($grid-gutter-width / 10)
	padding-top: ($grid-gutter-width / 10)

	display: flex
	align-items: center
	justify-content: space-between
	position: relative

.-controls
	position: relative
	max-height: $line-height-computed
	display: flex
	align-items: center

.-gif
	font-size: 20px
	margin-right: 12px
	transition: filter 0.15s, transform 0.2s ease
	cursor: pointer

	&:not(:hover)
		filter: grayscale(1) opacity(75%)

	&:hover
		transform: scale(1.2)

	&:focus
		outline: none

.emoji-button
	transition: filter 0.15s, transform 0.2s ease
	cursor: pointer
	image-rendering: pixelated

	&:not(:hover)
		filter: grayscale(1) opacity(75%)

	&:hover
		transform: scale(1.2)

	&:focus
		outline: none

</style>

<script lang="ts" src="./placeholder"></script>
