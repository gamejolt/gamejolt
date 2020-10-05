<script lang="ts" src="./player"></script>

<template>
	<div class="-controls" tabindex="0" @keydown="onKeypress">
		<!-- <app-shortkey shortkey="c" @press="toggleLeftPane('chat')" />
		<app-shortkey shortkey="m" @press="toggleLeftPane('library')" />
		<app-shortkey shortkey="y" @press="toggleLeftPane('context')" /> -->

		<div class="-top">
			<div
				class="-top-temp"
				style="height: 24px; width: 24px; background-color: red; border-radius: 8px;"
			/>
		</div>

		<div class="-bottom-gradient">
			<div class="-bottom-controls">
				<app-player-scrubber
					class="-scrubber"
					:player="player"
					@scrub="onScrub"
					@scrub-finish="onScrubFinish"
				/>

				<div class="-row">
					<app-player-playback :player="player" />
					<app-player-volume
						:player="player"
						@volume-down="triggerVolumeDown"
						@volume-up="triggerVolumeUp"
					/>
					<app-player-fullscreen class="-fullscreen" :player="player" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-controls
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0
	z-index: 1
	display: flex
	flex-direction: column
	justify-content: space-between
	/* JODO: better focus indication (parent currently has 'overflow: hidden')
	&:focus-within
	&:focus
		border-radius: 50%
		outline: none
		box-shadow: 0 0 0 3px rgba(21, 156, 228, 0.4)
	*/

.-bottom
	&-gradient
		background-image: linear-gradient(to bottom, rgba($black, 0), rgba($black, 0.5))
		padding-top: 16px

	&-controls
		display: flex
		flex-direction: column

.-row
	display: flex

.-scrubber
	margin-bottom: 4px

.-fullscreen
	margin-left: auto
</style>
