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

$-item-size = $shell-cbar-width - $cbar-h-padding * 2
$-blip-size = 10px
$-blip-left = (-($cbar-h-padding + $-blip-size * 0.5))
$-blip-top = $-item-size * 0.5 - $-blip-size * 0.5

.-item
	display: block
	position: relative
	margin-bottom: 8px
	width: $-item-size - 2px
	height: $-item-size - 2px

	&.-control
		pressy()
		img-circle()
		background-color: var(--theme-bg-offset)

		>>> .jolticon
			color: var(--theme-lighter)

.-blip, .-notification-count
	pointer-events: none

.-blip
	position: absolute
	width: $-blip-size
	height: $-blip-size
	top: $-blip-top
	left: -($-blip-size * 2)
	background-color: var(--theme-lighter)
	border-radius: 50%
	will-change: height, top, left
	z-index: 2
	transition: height 300ms $ease-in-out-back, top 300ms $ease-in-out-back, left 300ms $ease-in-out-back, background-color 300ms

.-blip-unread
	left: $-blip-left

.-blip-active
	top: 0
	left: $-blip-left
	height: $-item-size

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
