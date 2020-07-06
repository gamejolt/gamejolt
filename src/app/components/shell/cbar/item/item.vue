<template>
	<div class="-item" :class="{ '-control': isControl }">
		<slot />
		<div
			class="-blip"
			:class="{
				'-blip-unread': isUnread,
				'-blip-active': isActive,
			}"
			:style="{
				'background-color': highlight,
			}"
		/>
		<div v-if="notificationCount > 0" class="-notification-count">
			{{ notificationCountText }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'
@require '../variables'

.-item
	display: block
	position: relative
	margin-bottom: $cbar-item-spacing
	width: $cbar-item-size - 2px
	height: $cbar-item-size - 2px

	&.-control
		pressy()
		img-circle()
		background-color: var(--theme-bg-offset)

		.-blip
			background-color: var(--theme-highlight)

		>>> .jolticon
			color: var(--theme-lighter)

.-blip, .-notification-count
	pointer-events: none

.-blip
	position: absolute
	width: $cbar-blip-size
	height: $cbar-blip-size
	top: $cbar-blip-top
	left: -($cbar-blip-size * 2)
	background-color: var(--theme-lighter)
	border-radius: 50%
	will-change: height, top, left
	z-index: 2
	transition: height 300ms $ease-in-out-back, top 300ms $ease-in-out-back, left 300ms $ease-in-out-back, background-color 300ms

.-blip-unread
	left: $cbar-blip-left

.-blip-active
	top: 0
	left: $cbar-blip-left
	height: $cbar-item-size

.-notification-count
	position: absolute
	right: -2px
	bottom: -2px
	z-index: 2
	border-radius: 10px
	border-color: var(--theme-darkest)
	border-width: 3px
	border-style: solid
	padding-left: 4px
	padding-right: 4px
	font-size: $font-size-tiny
	text-align: center
	font-weight: bolder
	color: var(--theme-highlight-fg)
	background-color: var(--theme-highlight)
</style>

<script lang="ts" src="./item"></script>
