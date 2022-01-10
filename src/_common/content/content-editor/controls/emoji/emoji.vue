<script lang="ts" src="./emoji"></script>

<template>
	<div class="inset-container-controls">
		<transition name="fade">
			<AppEmoji
				v-if="visible"
				v-app-tooltip="panelVisible ? '' : $gettext('Insert Emoji')"
				class="emoji-button"
				:class="{
					'emoji-button-active': panelVisible,
				}"
				:emoji="emoji"
				tabindex="1"
				@click="onButtonClick"
				@mousedown="onMouseDown"
				@mouseenter="onMouseEnter"
			/>
		</transition>
		<transition name="fade">
			<div
				v-if="visible && panelVisible"
				ref="panel"
				class="emoji-panel"
				tabindex="1"
				@focus="onPanelFocus"
				@blur="onPanelBlur"
			>
				<div
					v-for="emoji of emojis"
					:key="emoji"
					class="emoji-box"
					:title="':' + emoji + ':'"
					@click="onClickEmoji(emoji)"
				>
					<AppEmoji :emoji="emoji" />
				</div>
			</div>
		</transition>
	</div>
</template>

<style lang="stylus" scoped>
.fade-enter-active
.fade-leave-active
	transition: opacity 0.05s

.fade-enter-from
.fade-leave-to
	opacity: 0

.emoji-button
	transition: filter 0.15s, transform 0.2s ease
	cursor: pointer
	image-rendering: pixelated

	&:not(:hover)
		filter: grayscale(1) opacity(75%)

	&:hover
		transform: scale(1.2)

	&:focus
		outline: none

.emoji-button-active
	filter: none !important
	transform: scale(1.2)

.emoji-panel
	elevate-2()
	rounded-corners-lg()
	change-bg('bg-offset')
	position: absolute
	bottom: 32px
	right: -8px
	display: flex
	flex-wrap: wrap
	width: 320px
	padding: 10px 8px 8px 8px
	z-index: $zindex-content-editor
	cursor: default

	&:focus
		outline: none

.emoji-box
	padding: 6px
	rounded-corners()
	cursor: pointer

	&:hover
		change-bg('bg-subtle')

	& > span
		cursor: pointer
</style>
