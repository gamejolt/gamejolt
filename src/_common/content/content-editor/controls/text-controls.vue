<script lang="ts" src="./text-controls"></script>

<template>
	<div
		ref="container"
		class="content-editor-text-controls"
		:style="{
			bottom: bottom,
			left: left,
		}"
		:class="{
			'controls-desktop': !Screen.isXs,
			'controls-mobile': Screen.isXs,
		}"
	>
		<transition name="fade">
			<div v-if="visible">
				<button
					v-if="capabilities.textBold && !isInHeading"
					v-app-tooltip="$gettext('Bold (Ctrl+B)')"
					class="control-button"
					:class="{
						'control-button-active': hasMark('strong'),
					}"
					@click.prevent="onClickBold"
					@mousedown.prevent
				>
					<app-jolticon icon="bold" />
				</button>
				<button
					v-if="capabilities.textItalic"
					v-app-tooltip="$gettext('Italic (Ctrl+I)')"
					class="control-button"
					:class="{
						'control-button-active': hasMark('em'),
					}"
					@click.prevent="onClickItalic"
					@mousedown.prevent
				>
					<app-jolticon icon="italic" />
				</button>
				<button
					v-if="capabilities.textStrike"
					v-app-tooltip="$gettext('Strikethrough')"
					class="control-button"
					:class="{
						'control-button-active': hasMark('strike'),
					}"
					@click.prevent="onClickStrikethrough"
					@mousedown.prevent
				>
					<app-jolticon icon="strikethrough" />
				</button>
				<button
					v-if="capabilities.textCode"
					v-app-tooltip="$gettext('Code (Ctrl+`)')"
					class="control-button"
					:class="{
						'control-button-active': hasMark('code'),
					}"
					@click.prevent="onClickCode"
					@mousedown.prevent
				>
					<app-jolticon icon="brackets" />
				</button>
				<button
					v-if="capabilities.textLink && capabilities.customLink"
					v-app-tooltip="$gettext(isAutolink ? 'Autolinked' : 'Link (Ctrl+K)')"
					class="control-button"
					:class="{
						'control-button-active': hasMark('link'),
					}"
					@click.prevent="onClickLink"
					@mousedown.prevent
				>
					<app-jolticon icon="link" />
				</button>

				<template v-if="shouldShowHeading">
					<span class="control-separator" />
					<button
						v-app-tooltip="$gettext('Heading Level 1')"
						class="control-button"
						:class="{
							'control-button-active': headingLevel === 1,
						}"
						@click.prevent="onClickHeading(1)"
						@mousedown.prevent
					>
						<app-jolticon icon="h1" />
					</button>
					<button
						v-app-tooltip="$gettext('Heading Level 2')"
						class="control-button"
						:class="{
							'control-button-active': headingLevel === 2,
						}"
						@click.prevent="onClickHeading(2)"
						@mousedown.prevent
					>
						<app-jolticon icon="h2" />
					</button>
				</template>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import './variables'

.fade-enter-active
.fade-leave-active
	transition: opacity 0.05s, transform 0.05s

.fade-enter
.fade-leave-to
	opacity: 0
	transform: translateY(20px) scale(0.5)

.content-editor-text-controls
	z-index: $zindex-content-editor

.controls-mobile
	position: fixed
	bottom: 0 !important
	left: 0 !important
	right: 0 !important

	& > div
		display: flex
		justify-content: center
		align-items: center
		change-bg('bg-offset')
		theme-prop('border-color', 'bg-subtle')
		padding-left: 4px
		padding-right: 4px

		& > .control-button
			padding-top: 0
			padding-bottom: 0

		& > .control-button > span
			margin: $controls-margin-vertical $controls-margin-horizontal
			font-size: $controls-font-size !important

		& > .control-button-active > span
			theme-prop('color', 'bi-bg', true)

.controls-desktop
	position: absolute

	& > div
		elevate-2()
		rounded-corners-lg()
		change-bg('darkest')
		display: flex
		justify-content: flex-start
		align-items: center
		padding: 10px 8px 8px 8px

		&:before
			caret(color: var(--theme-darkest), direction: 'down', size: 8px)
			content: ''
			display: block

		& > .control-button
			padding-left: 2px
			padding-right: 2px

			& > span
				theme-prop('color', 'lighter')
				font-size: $controls-font-size !important

		& > .control-button-active > span
			theme-prop('color', 'highlight', true)

.control-button
	cursor: pointer
	display: inline-block
	pressy()
	background-color: transparent
	border-style: none

.control-separator
	display: inline-block
	change-bg('bg-subtle')
	width: 2px
	height: 20px
	line-height: 20px
	margin: 0 10px
</style>
