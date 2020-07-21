<template>
	<app-form name="chat-send-form" ref="form">
		<app-shortkey shortkey="tab" @press="onTabKeyPressed" />

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
					:sleek="Screen.isXs"
					autofocus
					@submit="onSubmit"
					@insert-block-node="onEditorInsertBlockNode"
					@focus="onFocusEditor"
					@blur="onBlurEditor"
				/>

				<app-form-control-errors label="message" />
			</div>

			<app-button
				:class="{ '-sleek': Screen.isXs }"
				:disabled="!valid || !hasContent"
				v-app-tooltip="$gettext(`Send message`)"
				class="-send-button"
				sparse
				icon="share-airplane"
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
