<script lang="ts" src="./block-controls"></script>

<template>
	<div
		ref="container"
		class="content-editor-controls"
		:style="{
			top: top + 'px',
			left: '-32px',
		}"
		:class="{
			'controls-desktop': !Screen.isXs,
			'controls-mobile': Screen.isXs,
		}"
		tabindex="0"
	>
		<!-- ^ Tab index is 0 so that the main content editor does not focus when clicking the buttons -->
		<!-- When adding new buttons here, make sure they are added in both mobile and desktop views -->
		<transition name="fade">
			<div v-if="shouldShow">
				<template v-if="Screen.isXs">
					<button
						v-if="contextCapabilities.media"
						v-app-tooltip="$gettext('Add an image or GIF')"
						type="button"
						class="control-button"
						@click="onClickMedia"
					>
						<app-jolticon icon="screenshot" />
					</button>
					<button
						v-if="contextCapabilities.hasAnyEmbed"
						v-app-tooltip="$gettext('Add an embed')"
						type="button"
						class="control-button"
						@click="onClickEmbed"
					>
						<app-jolticon icon="embed" />
					</button>
					<button
						v-if="contextCapabilities.codeBlock"
						v-app-tooltip="$gettext('Add a code block')"
						type="button"
						class="control-button"
						@click="onClickCodeBlock"
					>
						<app-jolticon icon="brackets" />
					</button>
					<button
						v-if="contextCapabilities.blockquote"
						v-app-tooltip="$gettext('Add a quote')"
						type="button"
						class="control-button"
						@click="onClickBlockquote"
					>
						<app-jolticon icon="blockquote" />
					</button>
					<button
						v-if="contextCapabilities.spoiler"
						v-app-tooltip="$gettext('Add a spoiler')"
						type="button"
						class="control-button"
						@click="onClickSpoiler"
					>
						<app-jolticon icon="inactive" />
					</button>
					<button
						v-if="contextCapabilities.hr"
						v-app-tooltip="$gettext('Add a separator')"
						type="button"
						class="control-button"
						@click="onClickHr"
					>
						<app-jolticon icon="hr" />
					</button>
					<button
						v-if="contextCapabilities.list"
						v-app-tooltip="$gettext('Add a bulleted list')"
						type="button"
						class="control-button"
						@click="onClickBulletList"
					>
						<app-jolticon icon="bullet-list" />
					</button>
					<button
						v-if="contextCapabilities.list"
						v-app-tooltip="$gettext('Add a numbered list')"
						type="button"
						class="control-button"
						@click="onClickOrderedList"
					>
						<app-jolticon icon="numbered-list" />
					</button>
				</template>
				<template v-else>
					<app-button
						class="-add-button"
						:class="{
							'-add-button-rotated': !collapsed,
						}"
						circle
						solid
						:icon="'add'"
						@click="onClickExpand"
					/>
					<transition name="fade">
						<span v-if="!collapsed">
							<span class="dot-separator" />
							<app-button
								v-if="contextCapabilities.media"
								v-app-tooltip="$gettext('Add an image or GIF')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="screenshot"
								@click="onClickMedia"
							/>
							<app-button
								v-if="contextCapabilities.hasAnyEmbed"
								v-app-tooltip="$gettext('Add an embed')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="embed"
								@click="onClickEmbed"
							/>
							<app-button
								v-if="contextCapabilities.codeBlock"
								v-app-tooltip="$gettext('Add a code block')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="brackets"
								@click="onClickCodeBlock"
							/>
							<app-button
								v-if="contextCapabilities.blockquote"
								v-app-tooltip="$gettext('Add a quote')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="blockquote"
								@click="onClickBlockquote"
							/>
							<app-button
								v-if="contextCapabilities.spoiler"
								v-app-tooltip="$gettext('Add a spoiler')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="inactive"
								@click="onClickSpoiler"
							/>
							<app-button
								v-if="contextCapabilities.hr"
								v-app-tooltip="$gettext('Add a separator')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="hr"
								@click="onClickHr"
							/>
							<app-button
								v-if="contextCapabilities.list"
								v-app-tooltip="$gettext('Add a bulleted list')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="bullet-list"
								@click="onClickBulletList"
							/>
							<app-button
								v-if="contextCapabilities.list"
								v-app-tooltip="$gettext('Add a numbered list')"
								class="anim-fade-in-enlarge no-animate-leave btn-stagger"
								circle
								solid
								icon="numbered-list"
								@click="onClickOrderedList"
							/>
						</span>
					</transition>
				</template>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import './variables'

.content-editor-controls
	position: absolute
	z-index: $zindex-content-editor

	&:hover
		outline: 0 solid transparent !important

.-add-button
	transition: transform 0.2s ease

.-add-button-rotated
	transform: rotate(-45deg)

.fade-enter-active
.fade-leave-active
	transition: opacity 0.2s

.fade-enter
.fade-leave-to
	opacity: 0

.controls-mobile
	position: fixed
	top: auto !important
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

.control-button
	cursor: pointer
	display: inline-block
	pressy()
	background-color: transparent
	border-style: none

.btn-stagger
	for i in 2 .. 40
		&:nth-child({i})
			animation-delay: 20ms * i
</style>
