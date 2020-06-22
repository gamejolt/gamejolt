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
				/>

				<app-form-control-errors label="message" />
			</div>

			<app-button
				:disabled="!valid"
				v-app-tooltip="$gettext(`Send message`)"
				class="-send-button"
				sparse
				icon="share-airplane"
				:primary="isSendButtonSolid"
				:trans="!isSendButtonSolid"
				:solid="isSendButtonSolid"
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
	align-items: center
	margin-bottom: 16px

	@media $media-xs
		margin-bottom: 2px

	&-shifted
		margin-bottom: 52px

.-input
	margin-right: 4px
	width: "calc(100% + 4px - %s)" % ($-button-padding)

	@media $media-md-up
		margin-right: 8px
		margin-left: $left-gutter-size + $avatar-size
		width: "calc(100% - %s)" % ($left-gutter-size + $avatar-size + $-button-padding)

.-send-button
	width: 35px
</style>

<script lang="ts" src="./form"></script>
