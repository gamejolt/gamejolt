<script lang="ts">
import AppAspectRatio from '../../../../_common/aspect-ratio/AppAspectRatio.vue';
</script>

<script lang="ts" setup>
defineProps({
	horizontalPadding: {
		type: Number,
		default: 16,
	},
	forceHover: {
		type: Boolean,
	},
});
</script>

<template>
	<a
		class="chat-list-item"
		:class="{
			'-hovered': forceHover,
		}"
		:style="{
			paddingLeft: horizontalPadding + 'px',
			paddingRight: horizontalPadding + 'px',
		}"
	>
		<div class="-leading">
			<AppAspectRatio :ratio="1" show-overflow>
				<div class="-leading-inner">
					<slot name="leading">
						<div class="-placeholder-leading" />
					</slot>
				</div>

				<div class="-leading-float">
					<slot name="leadingFloat" />
				</div>
			</AppAspectRatio>
		</div>

		<div class="-title">
			<slot name="title">
				<div class="-placeholder-title" />
			</slot>
		</div>

		<div class="-trailing">
			<slot name="trailing" />
		</div>
	</a>
</template>

<style lang="stylus" scoped>
.chat-list-item
	display: flex
	align-items: center
	padding-top: 8px
	padding-bottom: 8px

	&.-hovered
	&:hover
		change-bg-rgba(var(--theme-fg-rgb), 0.1)

.-leading
	flex: none
	width: 30px
	font-weight: 400
	font-size: $font-size-base

.-leading-inner
	img-circle()
	overflow: hidden
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0
	display: flex

.-leading-float
	position: absolute
	left: 0
	bottom: -2px

.-title
	flex: auto
	display: inline-flex
	align-items: baseline
	padding-left: 16px
	gap: 8px
	color: var(--theme-fg)

.-trailing
	flex: none
	margin-left: auto

// .-container
// 	height: 50px
// 	overflow: hidden
// 	rounded-corners()

// .-label
// 	display: flex
// 	gap: 4px
// 	align-items: center

// .-name
// 	text-overflow()

// .-row-icon
// 	vertical-align: middle
// 	margin-left: auto

// .-avatar
// 	position: relative

// 	img
// 		img-circle()
// 		display: inline-block
// 		width: 24px
// 		vertical-align: middle

// 	.-group-icon
// 		img-circle()
// 		display: inline-flex
// 		align-items: center
// 		justify-content: center
// 		vertical-align: middle
// 		width: 32px
// 		height: 32px
// 		background-color: var(--theme-backlight)

// 		.jolticon
// 			color: var(--theme-backlight-fg) !important

// 	&-status
// 		right: 12px
// 		bottom: 10px
</style>
