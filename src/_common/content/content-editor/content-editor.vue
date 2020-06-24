<template>
	<div class="content-editor" @focus="onFocusOuter" ref="editor" tabindex="0">
		<div
			class="content-container"
			:class="{
				disabled: disabled,
				'content-container-with-gutter-1': editorGutterSize === 1,
				'content-container-with-gutter-2': editorGutterSize === 2,
			}"
			:style="{
				minHeight: containerMinHeight,
			}"
		>
			<app-scroll-scroller @scroll.native="onScroll" thin>
				<div
					class="-doc"
					:style="{ 'max-height': maxHeight > 0 ? maxHeight + 'px' : 'auto' }"
					:class="editorStyleClass"
					ref="doc"
				/>
			</app-scroll-scroller>
			<transition name="fade">
				<span
					v-if="shouldShowPlaceholder"
					class="content-placeholder text-muted"
					:class="editorStyleClass"
				>
					{{ placeholder }}
				</span>
			</transition>

			<app-content-editor-controls-inset-container :view="view" :state-counter="stateCounter">
				<transition name="fade">
					<app-content-editor-controls-gif-controls
						v-if="shouldShowGifButton"
						:view="view"
						:state-counter="stateCounter"
						:startup-activity="openedStartup ? '' : startupActivity"
						@opened-startup="onOpenedStartup"
					/>
				</transition>
				<transition name="fade">
					<app-content-editor-controls-emoji-panel
						v-if="shouldShowEmojiPanel"
						ref="emojiPanel"
						:view="view"
						:state-counter="stateCounter"
						:startup-activity="openedStartup ? '' : startupActivity"
						@visibilityChanged="onEmojiPanelVisibilityChanged"
						@opened-startup="onOpenedStartup"
					/>
				</transition>
			</app-content-editor-controls-inset-container>
		</div>

		<transition name="fade">
			<app-content-editor-block-controls
				v-if="shouldShowControls"
				:capabilities="capabilities"
				:view="view"
				:editor="this"
				:state-counter="stateCounter"
				:collapsed="controlsCollapsed"
				@collapsedChanged="onControlsCollapsedChanged"
			/>
		</transition>
		<transition name="fade">
			<app-content-editor-text-controls
				v-if="shouldShowTextControls"
				:capabilities="capabilities"
				:view="view"
				:state-counter="stateCounter"
				@click="onTextControlClicked"
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

<script lang="ts" src="./content-editor"></script>
