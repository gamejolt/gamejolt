<template>
	<!-- Message Sending -->
	<div class="chat-window-send fill-backdrop">
		<div class="-multiline-notice anim-fade-in no-animate-leave" v-if="showMultiLineNotice">
			<app-jolticon icon="notice" />
			<span v-translate>
				You are in multi-line editing mode. Press
				<code>ctrl+enter</code>
				to send.
			</span>
		</div>

		<div class="-container">
			<app-chat-window-send-form
				:single-line-mode="isSingleLineMode"
				@submit="sendMessage($event)"
				@single-line-mode-change="onSingleLineModeChanged($event)"
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
</style>

<script lang="ts" src="./send"></script>
