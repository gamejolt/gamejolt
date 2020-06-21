<template>
	<app-form name="chat-send-form" ref="form">
		<app-form-group name="content" hide-label class="-form">
			<div class="-input">
				<app-form-control-content
					ref="editor"
					:content-context="contentContext"
					:temp-resource-context-data="contentEditorTempResourceContextData"
					:placeholder="placeholder"
					:single-line-mode="!multiLineMode"
					:rules="{
						max_content_length: [500],
					}"
					@submit="onEditorSubmit"
					@insert-block-node="onEditorInsertBlockNode"
				/>

				<app-form-control-errors label="message" />
			</div>

			<app-button
				:disabled="!valid"
				v-app-tooltip="$gettext(`Send message`)"
				class="-send-button"
				sparse
				trans
				icon="share-airplane"
				@click="onClickSubmit"
			/>
		</app-form-group>
	</app-form>
</template>

<style lang="stylus" scoped>
@require '../../variables'

.-form
	margin-bottom: 8px

.-input
	margin-right: 8px
	margin-left: $left-gutter-size + $avatar-size
	width: calc(100% - 35px - 8px - 4px - 64px)
	display: inline-block

.-send-button
	width: 35px
	display: inline-block
</style>

<script lang="ts" src="./form"></script>
