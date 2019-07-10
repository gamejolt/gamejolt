<template>
	<!-- Message Sending -->
	<div class="chat-window-send fill-darker">
		<div class="-multiline-notice anim-fade-in no-animate-leave" v-if="multiLineMode">
			<app-jolticon icon="notice" />
			<span v-translate>
				You are in multi-line editing mode. Press
				<code>ctrl+enter</code>
				to send.
			</span>
		</div>

		<!--
		ctrl+enter sends key code 10 on Chrome. Yeah.
		binding the :key allows it to refocus each time the room changes
	-->
		<div class="-container">
			<div class="-button" @click="sendClicked()">
				<app-jolticon icon="add-comment" />
			</div>
			<div class="-input">
				<textarea
					ref="input"
					:key="chat.room.id"
					class="form-control"
					placeholder="Enter message..."
					:rows="Screen.isXs ? 1 : 2"
					v-app-focus-when
					v-model="message"
					@change="onChange"
					@keydown.shift.enter="shiftEnter"
					@keydown.ctrl.enter.prevent="ctrlEnter"
					@keydown.ctrl.10.prevent="ctrlEnter"
					@keydown.enter="enter"
				></textarea>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-multiline-notice
	theme-prop('color', 'light')
	margin-bottom: 5px
	font-size: $font-size-small

.-container
	position: relative

textarea
	resize: none
	font-size: $font-size-small
	border: 0
	background-color: transparent
	color: $white

	@media $media-sm-up
		change-bg('dark')

.-button
	display: none

@media $media-mobile
	.-input
		margin-right: 70px

	.-button
		theme-prop('color', 'gray')
		display: block
		position: absolute
		top: 7px
		right: 5px
</style>

<script lang="ts" src="./send"></script>
