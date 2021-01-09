<script lang="ts" src="./content-editor"></script>

<template>
	<div ref="editor" class="content-editor" tabindex="0" @focus="onFocusOuter">
		<div
			class="content-container"
			:class="{
				disabled: disabled,
			}"
			:style="{
				minHeight: containerMinHeight,
			}"
		>
			<app-scroll-scroller class="content-container-scroller" thin @scroll.native="onScroll">
				<div
					:class="{
						'content-container-gutter-1': editorGutterSize === 1,
						'content-container-gutter-2': editorGutterSize === 2,
					}"
				>
					<div
						ref="doc"
						class="-doc"
						:style="{ 'max-height': maxHeight > 0 ? maxHeight + 'px' : 'auto' }"
						:class="editorStyleClass"
					/>
				</div>

				<transition name="fade">
					<span
						v-if="shouldShowPlaceholder"
						class="content-placeholder text-muted"
						:class="editorStyleClass"
					>
						{{ placeholder }}
					</span>
				</transition>

				<app-content-editor-inset-controls :view="view" :state-counter="stateCounter">
					<transition name="fade">
						<app-content-editor-controls-gif v-if="!GJ_IS_APP && shouldShowGifButton" />
					</transition>
					<transition name="fade">
						<app-content-editor-controls-emoji
							v-if="shouldShowEmojiPanel"
							ref="emojiPanel"
							@visibility-change="onEmojiPanelVisibilityChanged"
						/>
					</transition>
				</app-content-editor-inset-controls>
			</app-scroll-scroller>
		</div>

		<template v-if="!GJ_IS_APP">
			<transition name="fade">
				<app-content-editor-block-controls
					v-if="shouldShowControls"
					:editor="this"
					:state-counter="stateCounter"
					:collapsed="controlsCollapsed"
					@collapsed-change="onControlsCollapsedChanged"
				/>
			</transition>
			<transition name="fade">
				<app-content-editor-text-controls
					v-if="shouldShowTextControls"
					:state-counter="stateCounter"
				/>
			</transition>
			<transition name="fade">
				<app-content-editor-controls-mention-autocomplete
					:can-show="canShowMentionSuggestions"
					:view="view"
					:state-counter="stateCounter"
					@insert="onInsertMention"
					@users-change="onMentionUsersChange"
				/>
			</transition>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.content-container
	position: relative

	&-scroller
		// Spacing for the scrollbar side
		margin-right: 4px
		// Add extra padding to get total spacing equal to '.form-control' padding.
		padding-right: $padding-base-horizontal - @margin-right

	// Gutter space to not overlay potential content
	&-gutter-1
		padding-right: 32px

	&-gutter-2
		padding-right: 64px

.content-editor
	position: relative
	padding-top: 8px
	padding-bottom: 8px
	padding-right: 0

.content-placeholder
	top: 4px
	left: 4px
	position: absolute
	font-style: italic
	pointer-events: none
	user-select: none

.disabled
	theme-prop('color', 'fg-muted')

// Do not show dotted selection outline
>>> .ProseMirror
	outline: 0 solid transparent !important

// Override prosemirror selection border around selected nodes
>>> .ProseMirror-selectednode
	theme-prop('outline-color', 'bi-bg') !important

>>> .content-editor-spoiler
	change-bg('bg-offset')
	rounded-corners-lg()
	font-size: $font-size-base
	padding-top: 1px
	border: $border-width-small dashed var(--theme-bg-subtle)
	position: relative

	&::before
		theme-prop('color', 'fg-muted')
		content: 'Spoiler'
		position: absolute
		top: 2px
		right: 5px
		font-size: $font-size-tiny
		text-transform: uppercase

>>> .content-editor-spoiler:after
	content: none

// Give each paragraph a 10px margin, except the first and last.
>>> p
	margin-top: 10px
	margin-bottom: 10px

	&:first-child
		margin-top: 4px

	&:last-child
		margin-bottom: 4px

>>> code
	white-space: pre-wrap

>>> td
	border-width: $border-width-small
	border-style: solid
	padding: 4px
	min-width: 2em

>>> th
	padding: 4px

>>> blockquote::before
	white-space: normal

>>> blockquote::after
	white-space: normal

>>> table
	table-layout: fixed
	width: 100%

	& > tr:first-child
		& > td
		& > th
			border-top-width: 0

	& > tr > th
		border-width: 0 $border-width-small $border-width-large 0
		border-bottom-style: solid
		border-right-style: dashed
		theme-prop('border-color', 'fg-muted')

	& > tr > th:last-child
		border-right-width: 0

	& > tr > td
		border-width: $border-width-small $border-width-small 0 0
		border-top-style: solid
		border-right-style: dashed
		theme-prop('border-color', 'fg-muted')

	& > tr > td:last-child
		border-right-width: 0

.fade-enter-active
.fade-leave-active
	transition: opacity 200ms $strong-ease-out

.fade-enter
.fade-leave-to
	opacity: 0

>>> a
	cursor: inherit

	&:hover
		theme-prop('color', 'link')

>>> .content-editor-mention
	theme-prop('color', 'link')

>>> .content-editor-tag
	theme-prop('color', 'link')

>>> .content-editor-link
	theme-prop('color', 'link')

// Add a minimal margin to media items so they don't directly border the top of the editor
>>> .media-item
	margin-top: ($line-height-computed / 3)

>>> img.emoji
	border-radius: 0
</style>
