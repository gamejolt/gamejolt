<script lang="ts" src="./form"></script>

<template>
	<app-form ref="form" name="chat-send-form">
		<app-shortkey shortkey="tab" @press="onTabKeyPressed" />

		<div v-if="isEditing" class="-editing-message">
			<app-jolticon icon="edit" />
			<translate>Editing Message</translate>
			<a class="-editing-message-cancel" @click="cancelEditing">
				<translate>Cancel</translate>
			</a>
		</div>

		<div v-if="!Screen.isXs" class="-multiline-notice anim-fade-in no-animate-leave">
			<template v-if="showMultiLineNotice">
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
			</template>
		</div>

		<app-form-group
			name="content"
			hide-label
			class="-form"
			:class="{
				'-form-shifted': shouldShiftEditor,
				'-editing': isEditing,
			}"
		>
			<div class="-input">
				<app-form-control-content
					ref="editor"
					v-app-observe-dimensions="onInputResize"
					:content-context="contentContext"
					:temp-resource-context-data="contentEditorTempResourceContextData"
					:placeholder="placeholder"
					:single-line-mode="singleLineMode"
					:rules="{
						max_content_length: maxContentLength,
					}"
					:max-height="160"
					:display-rules="displayRules"
					:compact="Screen.isXs"
					:autofocus="!Screen.isMobile"
					@submit="onSubmit"
					@insert-block-node="onEditorInsertBlockNode"
					@focus="onFocusEditor"
					@blur="onBlurEditor"
					@keydown.native.up="onUpKeyPressed"
					@changed="onChange($event)"
				/>

				<app-form-control-errors label="message" />
			</div>

			<app-button
				v-app-tooltip="isEditing ? $gettext(`Edit message`) : $gettext(`Send message`)"
				:disabled="isSendButtonDisabled"
				class="-send-button"
				sparse
				:icon="isEditing ? 'check' : 'share-airplane'"
				:primary="hasContent"
				:trans="!hasContent"
				:solid="hasContent"
				@click="onSubmit"
			/>
		</app-form-group>

		<div class="-typing">
			<div v-if="usersTyping.length > 0">
				{{ printTyping() }}
			</div>
		</div>
	</app-form>
</template>

<style lang="stylus" scoped>
@import '../../variables'
@import '~styles/variables'
@import '~styles-lib/mixins'

$-button-height = 48px
$-button-width = 40px
$-button-margin = 4px
$-button-spacing = $-button-width + ($-button-margin * 3)
$-button-spacing-xs = $-button-height

.-form
	display: flex
	position: relative
	margin-bottom: 0

	@media $media-xs
		margin-top: 4px
		border-top: $border-width-base solid var(--theme-bg-subtle)
		padding-top: 1px

	@media $media-sm-up
		margin-top: 8px

	&-shifted
		margin-bottom: 52px

	&.-editing
		margin-top: 0
		padding-top: 1px
		border-top: none

.-typing
	position: relative

	@media $media-xs
		padding-left: 4px
		margin-left: 4px

	@media $media-sm-up
		margin-left: $left-gutter-size + $avatar-size
		margin-right: $-button-spacing

.-typing
.-multiline-notice
.-editing-message
	height: 28px
	font-size: $font-size-small
	color: var(--theme-light)
	padding: 4px 0

.-multiline-notice
	margin-left: $left-gutter-size + $avatar-size

.-editing-message
	position: relative

	@media $media-xs
		padding-left: 4px
		border-top: $border-width-base solid var(--theme-bg-subtle)

	@media $media-sm-up
		margin-left: $left-gutter-size + $avatar-size
		margin-right: $-button-spacing

	&-cancel
		position: absolute
		right: 0

		@media $media-xs
			right: $-button-spacing-xs + 4px

.-input
	width: 'calc(100% - %s)' % $-button-spacing-xs

	@media $media-sm-up
		margin-left: $left-gutter-size + $avatar-size
		width: 'calc(100% - %s)' % ($left-gutter-size + $avatar-size + $-button-spacing)

.-send-button
	display: flex
	align-items: center
	justify-content: center
	height: $-button-height
	margin: 0
	flex: none
	align-self: flex-end
	transition: color 0.3s, background-color 0.3s

	@media $media-xs
		width: $-button-spacing-xs
		border-radius: 0

	@media $media-sm-up
		width: $-button-width
		margin: 0 ($-button-margin * 2) 0 $-button-margin

	&.-disabled
		&:hover
			color: var(--theme-fg) !important
			background-color: transparent !important
			border-color: transparent !important
</style>
