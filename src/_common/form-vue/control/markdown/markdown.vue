<script lang="ts" src="./markdown"></script>

<template>
	<div
		class="form-control-markdown"
		:class="{
			'has-controls': showMediaItems,
		}"
	>
		<nav class="platform-list inline clearfix">
			<ul v-if="!disablePreview">
				<li>
					<a :class="{ active: currentTab === 'edit' }" @click="changeTab('edit')">
						<translate>Write</translate>
					</a>
				</li>
				<li v-if="hasContent">
					<a :class="{ active: currentTab === 'preview' }" @click="changeTab('preview')">
						<translate>Preview</translate>
					</a>
				</li>
			</ul>
			<div
				v-if="
					shouldShowMarkdownHelp || shouldShowWidgetHelp || htmlSupport || allowCodeEditor
				"
				class="form-control-markdown-helptext"
			>
				<span
					v-if="allowCodeEditor"
					class="form-control-markdown-helplink hidden-xs hidden-sm"
				>
					<a
						v-if="editorMode === 'textarea'"
						v-app-tooltip="$gettext(`Switch to a code editor`)"
						@click="editorMode = 'code-editor'"
					>
						<app-jolticon icon="brackets" />
						<translate>Code Editor</translate>
					</a>
					<a
						v-if="editorMode === 'code-editor'"
						v-app-tooltip="$gettext(`Switch back to a simple text box`)"
						@click="editorMode = 'textarea'"
					>
						<app-jolticon icon="blog-article" />
						<translate>Basic Editor</translate>
					</a>
				</span>
				<span v-if="shouldShowMarkdownHelp" class="form-control-markdown-helplink">
					<a :href="Environment.helpBaseUrl + '/' + markdownHelpUrl" target="_blank">
						<app-jolticon icon="markdown" class="hidden-xs" />
						<app-jolticon icon="markdown" big class="hidden-sm hidden-md hidden-lg" />
						<translate class="hidden-xs">Use Markdown to Edit</translate>
					</a>
				</span>
				<span v-if="shouldShowWidgetHelp" class="form-control-markdown-helplink">
					<a :href="Environment.helpBaseUrl + '/widgets-' + markdownMode" target="_blank">
						<app-jolticon icon="plug" class="hidden-xs" />
						<app-jolticon icon="plug" big class="hidden-sm hidden-md hidden-lg" />
						<translate class="hidden-xs">Available Widgets</translate>
					</a>
				</span>
				<span v-if="htmlSupport" class="form-control-markdown-helplink">
					<app-jolticon icon="html5" class="hidden-xs" />
					<app-jolticon icon="html5" big class="hidden-sm hidden-md hidden-lg" />
					<translate class="hidden-xs">HTML Supported</translate>
				</span>
			</div>
		</nav>

		<template v-if="currentTab === 'edit'">
			<textarea
				v-if="editorMode === 'textarea'"
				:id="id"
				v-validate="{ rules: validationRules }"
				v-app-form-autosize="bootstrapAutosize"
				v-app-focus-when="autofocus"
				class="form-control"
				:style="{
					maxHeight,
				}"
				rows="1"
				:class="editorClass"
				:name="group.name"
				:placeholder="placeholder"
				:disabled="disabled"
				:value="controlVal"
				@input="onChange($event.target.value)"
			/>

			<div v-else-if="editorMode === 'code-editor'">
				<app-codemirror
					:id="id"
					:value="controlVal"
					:options="{
						mode: 'gfm',
					}"
					@change="onChange"
				/>
			</div>
			<app-form-control-markdown-media-items
				v-if="showMediaItems"
				:type="mediaItemType"
				:disabled="disabled"
				:parent-id="mediaItemParentId"
			/>
		</template>
		<div
			v-else-if="currentTab === 'preview'"
			class="well form-control-markdown-preview"
			:style="{
				maxHeight,
			}"
		>
			<app-loading v-if="isLoadingPreview" />

			<div v-else :class="previewClass" v-html="previewContent" />
		</div>
	</div>
</template>

<style lang="stylus" src="./markdown.styl" scoped></style>
