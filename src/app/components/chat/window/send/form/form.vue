<template>
	<app-form name="chat-send-form" ref="form">
		<app-shortkey shortkey="tab" @press="onTabKeyPressed" />

		<div class="-editing-message" v-if="isEditing">
			<translate>Editing Message</translate>
			<a class="-editing-message-cancel" @click="cancel">
				<translate>Cancel</translate>
			</a>
		</div>

		<app-form-group
			name="content"
			hide-label
			class="-form"
			:class="{ '-form-shifted': shouldShiftEditor }"
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
					autofocus
					@submit="onSubmit"
					@insert-block-node="onEditorInsertBlockNode"
					@focus="onFocusEditor"
					@blur="onBlurEditor"
					@keydown.native.up="onUpKeyPressed"
				/>

				<app-form-control-errors label="message" />
			</div>

			<app-button
				:disabled="isSendButtonDisabled"
				v-app-tooltip="isEditing ? $gettext(`Edit message`) : $gettext(`Send message`)"
				class="-send-button"
				sparse
				:icon="isEditing ? 'edit' : 'share-airplane'"
				:primary="hasContent"
				:trans="!hasContent"
				:solid="hasContent"
				@click="onSubmit"
			/>
		</app-form-group>
	</app-form>
</template>

<style lang="stylus" scoped>
@import '../../variables'
@import '~styles/variables'
@import '~styles-lib/mixins'

$-button-padding = 48px

.-form
	display: flex
	position: relative
	margin-top: 8px
	margin-bottom: 16px
	padding-top: 4px

	@media $media-xs
		margin-top: 4px
		margin-bottom: 0
		border-top: $border-width-base solid var(--theme-bg-subtle)
		padding-top: 1px

	&-shifted
		margin-bottom: 52px

.-editing-message
	position: relative
	display: flex
	margin-bottom: 8px
	padding-top: 4px
	padding-bottom: 4px
	padding-left: $left-gutter-size + $avatar-size
	background-color: var(--theme-bg-offset)
	font-size: $font-size-small
	border-top-left-radius: $border-radius-base
	border-top-right-radius: $border-radius-base

	@media $media-xs
		padding-left: 4px

	&-cancel
		position: absolute
		right: 4px

		@media $media-md-up
			padding-right: 12px

.-input
	width: 'calc(100% + 4px - %s)' % $-button-padding

	@media $media-sm-up
		margin-left: $left-gutter-size + $avatar-size

	@media $media-md-up
		width: 'calc(100% - %s)' % ($left-gutter-size + $avatar-size + $-button-padding)

.-send-button
	display: flex
	align-items: center
	justify-content: center
	width: $-button-padding
	height: $-button-padding
	margin: 0
	flex: none
	align-self: flex-end
	transition: color 0.3s, background-color 0.3s

	@media $media-xs
		border-radius: 0

	@media $media-sm-up
		width: 40px
		margin: 0 8px 0 4px

	&.-disabled
		&:hover
			color: var(--theme-fg) !important
			background-color: transparent !important
			border-color: transparent !important
</style>

<script lang="ts" src="./form"></script>
