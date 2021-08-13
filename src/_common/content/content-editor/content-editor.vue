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
			<app-scroll-scroller class="content-container-scroller" thin @scroll="onScroll">
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

				<app-content-editor-controls-inset-container
					:view="view"
					:state-counter="stateCounter"
				>
					<transition name="fade">
						<app-content-editor-controls-gif-controls
							v-if="shouldShowGifButton"
							:view="view"
							:state-counter="stateCounter"
						/>
					</transition>
					<transition name="fade">
						<app-content-editor-controls-emoji-panel
							v-if="shouldShowEmojiPanel"
							ref="emojiPanel"
							:view="view"
							:state-counter="stateCounter"
							@visibility-changed="onEmojiPanelVisibilityChanged"
						/>
					</transition>
				</app-content-editor-controls-inset-container>
			</app-scroll-scroller>
		</div>

		<transition name="fade">
			<app-content-editor-block-controls
				v-if="shouldShowControls"
				:capabilities="capabilities"
				:view="view"
				:editor="this"
				:state-counter="stateCounter"
				:collapsed="controlsCollapsed"
				@collapsed-changed="onControlsCollapsedChanged"
			/>
		</transition>
		<transition name="fade">
			<app-content-editor-text-controls
				v-if="shouldShowTextControls"
				:capabilities="capabilities"
				:view="view"
				:state-counter="stateCounter"
			/>
		</transition>
		<transition name="fade">
			<app-content-editor-controls-mention-autocomplete-controls
				:can-show="canShowMentionSuggestions"
				:view="view"
				:state-counter="stateCounter"
				@insert="onInsertMention"
				@users-change="onMentionUsersChange"
			/>
		</transition>
	</div>
</template>

<style lang="stylus" src="./content-editor.styl" scoped></style>
