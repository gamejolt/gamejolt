<template>
	<!-- Message Sending -->
	<div class="chat-window-send fill-backdrop">
		<div class="-multiline-notice anim-fade-in no-animate-leave" v-if="showMultiLineNotice">
			<app-jolticon icon="notice" />
			<span v-if="isMac" v-translate>
				You are in multi-line editing mode. Press
				<code>cmd+enter</code>
				to send.
			</span>
			<span v-else v-translate>
				You are in multi-line editing mode. Press
				<code>ctrl+enter</code>
				to send.
			</span>
		</div>

		<div class="-container">
			<app-chat-window-send-form
				:is-editing="isEditing"
				:single-line-mode="isSingleLineMode"
				:room="room"
				@submit="submit($event)"
				@single-line-mode-change="onSingleLineModeChanged($event)"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require '../variables'

.-multiline-notice
	theme-prop('color', 'light')
	margin-bottom: 4px
	font-size: $font-size-small
	margin-left: $left-gutter-size + $avatar-size

.-container
	position: relative
</style>

<script lang="ts" src="./send"></script>
