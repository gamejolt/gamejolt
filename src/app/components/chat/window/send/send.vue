<template>
	<!-- Message Sending -->
	<div class="chat-window-send fill-backdrop">
		<div class="-multiline-notice anim-fade-in no-animate-leave" v-if="multiLineMode">
			<app-jolticon icon="notice" />
			<span v-translate>
				You are in multi-line editing mode. Press
				<code>ctrl+enter</code>
				to send.
			</span>
		</div>

		<div class="-container">
			<app-chat-window-send-form
				:multi-line-mode="multiLineMode"
				@submit="sendMessage($event)"
				@multi-line-mode-change="onMultiLineModeChanged($event)"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-multiline-notice
	theme-prop('color', 'light')
	margin-bottom: 4px
	font-size: $font-size-small

.-container
	position: relative

textarea
	change-bg('dark')
	padding: 8px
	resize: none
	border: 0
	color: $white

.-button
	display: none

@media $media-mobile
	textarea
		padding-right: 20px + (8px * 2)

	.-button
		theme-prop('color', 'fg-muted')
		display: block
		position: absolute
		top: 10px
		right: 6px

.content-editor-form-control
	height: auto
	resize: vertical

.content-editor-form-control:focus-within
	theme-prop('border-color', 'fg-muted')
	box-shadow: none
	outline: 0
</style>

<script lang="ts" src="./send"></script>
