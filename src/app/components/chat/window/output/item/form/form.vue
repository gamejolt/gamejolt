<template>
	<app-form name="chat-edit-form" ref="form">
		<app-shortkey shortkey="tab" @press="onTabKeyPressed" />

		<app-form-group name="content" hide-label>
			<app-form-control-content
				ref="editor"
				v-app-observe-dimensions="onInputResize"
				:content-context="contentContext"
				:temp-resource-context-data="contentEditorTempResourceContextData"
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

			<div class="text-right">
				<app-button
					:disabled="!valid || !hasContent"
					:primary="hasContent"
					:trans="!hasContent"
					:solid="hasContent"
					@click="onSubmit"
				>
					<translate>Save</translate>
				</app-button>

				<app-button trans @click="onCancel">
					<translate>Cancel</translate>
				</app-button>
			</div>
		</app-form-group>
	</app-form>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

>>> .form-group
	margin-bottom: 10px
	margin-right: 20px
</style>

<script lang="ts" src="./form"></script>
