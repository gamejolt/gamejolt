<script lang="ts" setup>
defineProps({
	percent: {
		type: Number,
		required: true,
	},
	thin: {
		type: Boolean,
	},
	active: {
		type: Boolean,
	},
	glow: {
		type: Boolean,
	},
	indeterminate: {
		type: Boolean,
	},
	animate: {
		type: Boolean,
		default: true,
	},
	hideZero: {
		type: Boolean,
	},
	bgSubtle: {
		type: Boolean,
	},
	primary: {
		type: Boolean,
	},
});
</script>

<template>
	<div
		class="progress"
		:class="{
			'-thin': thin,
			'progress-striped': indeterminate,
			'-active': active,
			'-glow': glow,
			'-animate': animate,
			'-subtle': bgSubtle,
			'-primary': primary,
		}"
	>
		<div
			v-if="percent > 0 || !hideZero"
			class="progress-bar"
			:style="{ width: Math.max(0, Math.min(100, percent)) + '%' }"
		/>
		<div class="-text">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@keyframes progress-bar-stripes
	from
		background-position: 40px 0

	to
		background-position: 0 0

.progress
	--progress-fill: var(--theme-highlight)
	rounded-corners()
	change-bg('fg-muted')
	position: relative
	height: $line-height-computed
	line-height: $line-height-computed
	margin-bottom: $line-height-computed

	&.-subtle
		change-bg('bg-subtle')

	&.-primary
		--progress-fill: var(--theme-link)


.-text
	text-overflow()
	position: relative
	display: inline-block
	vertical-align: middle
	font-size: $font-size-small
	color: var(--theme-highlight-fg)
	padding: 0 10px

.progress-bar
	rounded-corners()
	change-bg('highlight')
	position: absolute
	top: 0
	left: 0
	width: 0
	min-width: 5px
	height: 100%

	&.-hide-zero
		min-width: 0

	.progress.-primary &
		change-bg('link')

	.progress.-animate &
		transition: width 600ms ease
		will-change: width

.progress-bar + .progress-bar
	border: $border-width-base solid var(--theme-fg-muted)

.-thin
	&
	.progress-bar
		height: 5px

.progress-striped .progress-bar
.progress-bar.progress-striped
	background-image: linear-gradient(45deg, var(--theme-fg-muted) 25%, transparent 25%, transparent 50%, var(--theme-fg-muted) 50%, var(--theme-fg-muted) 75%, transparent 75%, transparent)
	background-size: 40px 40px

.progress.-active .progress-bar
.progress-bar.-active
	animation: progress-bar-stripes 2s linear infinite

.progress.-glow .progress-bar
	box-shadow: 0px 0px 4px var(--progress-fill)
</style>
