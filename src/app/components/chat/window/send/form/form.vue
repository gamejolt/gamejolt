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
				:disabled="!valid || !hasContent"
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
@require '../../variables'
@require '~styles/variables'
@require '~styles-lib/mixins'

$-button-padding = 48px

.-form
	display: flex
	position: relative
	margin-bottom: 16px

	@media $media-xs
		margin-bottom: 2px

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
	margin-right: 4px
	width: "calc(100% + 4px - %s)" % ($-button-padding)

	@media $media-md-up
		margin-right: 8px
		margin-left: $left-gutter-size + $avatar-size
		width: "calc(100% - %s)" % ($left-gutter-size + $avatar-size + $-button-padding)

.-send-button
	display: flex
	align-items: center
	justify-content: center
	width: 40px
	transition: color 0.3s, background-color 0.3s

	&.-disabled
		&:hover
			color: var(--theme-fg) !important
			background-color: transparent !important
			border-color: transparent !important
</style>

<script lang="ts" src="./form"></script>
