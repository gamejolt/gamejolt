<script lang="ts" setup>
import { Screen } from '../../screen/screen-service';

defineProps({
	center: Boolean,
});
</script>

<template>
	<div>
		<nav class="tab-list" :class="{ 'tab-list-centered': center }">
			<div class="tab-list-content">
				<div class="clearfix">
					<slot />

					<div class="tab-list-addons">
						<div v-if="!Screen.isMobile" class="tab-list-meta">
							<slot name="meta" />
						</div>

						<div v-if="!Screen.isMobile" class="tab-list-input">
							<slot name="input" />
						</div>

						<div v-if="!Screen.isMobile" class="tab-list-controls">
							<slot name="controls" />
						</div>
					</div>
				</div>
			</div>
		</nav>

		<div v-if="Screen.isMobile" class="tab-list-input">
			<slot name="input" />
		</div>

		<div v-if="Screen.isMobile" class="tab-list-meta">
			<slot name="meta" />
		</div>
	</div>
</template>

<style lang="stylus">
.tab-list
	full-bleed-xs()
	position: relative
	margin-bottom: $line-height-computed
	padding-left: $grid-gutter-width * 0.5
	padding-right: $grid-gutter-width * 0.5

	&::after
		change-bg('bg-subtle')
		content: ''
		position: absolute
		left: 0
		right: 0
		bottom: 0
		height: $border-width-base
		z-index: 1

	@media $media-xs
		padding-left: 0
		padding-right: 0

		&-content
			overflow-x: auto
			overflow-y: hidden
			white-space: nowrap

	ul
		display: inline-block
		margin: 0
		padding: 0

		@media $media-xs
			float: none !important

		& > li
			// We save the actual BG color outside the <a> so that we can use
			// it to override the hover styling when the <a> is active.
			--bg-save: var(--theme-bg-actual)
			display: inline-block
			margin: 0

			@media $media-sm-up
				&:first-of-type > a
					margin-left: 0

				&:last-of-type > a
					margin-right: 0

			& > a
				theme-prop('color', 'fg')
				theme-prop('border-color', 'bg-subtle')
				display: inline-block
				padding: $tab-list-padding-v $tab-list-padding-h
				margin: 0 3px
				cursor: pointer
				border-width: $border-width-base
				border-style: solid
				border-top-left-radius: $border-radius-base
				border-top-right-radius: $border-radius-base
				border-bottom: 0
				font-weight: bold
				// Don't allow to select the text when clicking on a tab.
				user-select: none

				&:hover
					change-bg('bg-offset')

				&.active
					theme-prop('color', 'link')
					background-color: var(--bg-save) !important
					position: relative
					z-index: 2

				// Nothing needs to be clickable or anything within the item,
				// since all the events happen within the <a> tag.
				& > *
					pointer-events: none

			@media $media-xs
				&:first-child a
					margin-left: $grid-gutter-width-xs * 0.5

				&:last-child a
					margin-right: $grid-gutter-width-xs * 0.5

	&-centered
		text-align: center
		margin-left: 0
		margin-right: 0

	&-addons
		float: right

	&-meta
		theme-prop('color', 'fg-muted')
		font-size: $font-size-small
		margin-bottom: $line-height-computed

		@media $media-md-up
			float: left
			margin-top: 7px
			margin-bottom: 0

	&-controls
		float: right

		.button
			border-bottom-left-radius: 0 !important
			border-bottom-right-radius: 0 !important

	&-input
		margin-bottom: $line-height-computed

		@media $media-md-up
			float: right
			margin-left: 20px
			margin-bottom: 0
			max-width: 250px
</style>
