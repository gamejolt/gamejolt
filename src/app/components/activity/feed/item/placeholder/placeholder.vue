<template>
	<div class="-container">
		<div class="-item">
			<div class="-header">
				<div class="-header-content">
					<div class="-header-avatar" />

					<div class="-header-byline">
						<div class="-header-byline-name">
							<span class="-placeholder-text" style="width: 100px" />
						</div>
					</div>
				</div>
				<div class="-header-meta">
					<span class="-placeholder-small" style="width: 75px" />
				</div>
			</div>

			<div class="fireside-post-lead">
				<span class="-placeholder-text" />
				<span class="-placeholder-text" />
				<span class="-placeholder-text" style="width: 40%" />
			</div>

			<div class="-controls">
				<app-button-placeholder sparse circle />
				<app-button-placeholder sparse circle />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '../../event-item/event-item'
@require '~styles-lib/mixins'

// Gotta override the border hover styling of event items.
.-item
	&, &:hover
		theme-prop('border-color', 'bg-offset')
		cursor: default

		@media $media-sm-up
			theme-prop('border-color', 'bg-subtle')

.-placeholder-text
	lazy-placeholder-inline()

.-placeholder-small
	lazy-placeholder-inline()
	height: $font-size-small
</style>

<script lang="ts" src="./placeholder"></script>
