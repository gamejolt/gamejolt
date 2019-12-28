<template>
	<div>
		<!-- Attachments -->
		<div class="-attachment-controls">
			<div class="-button"></div>
			<div class="-button"></div>
			<div class="-button"></div>
		</div>

		<!-- Post title (short) -->
		<div class="form-group -lead-form-group">
			<div class="form-control"></div>
		</div>

		<!-- Controls -->
		<div class="-controls">
			<div class="-controls-attachments">
				<div class="-button"></div>
				<div class="-button"></div>
				<div class="-button"></div>
				<div class="-button"></div>
			</div>

			<div class="-controls-submit">
				<div class="-controls-submit-button">
					<div class="-button"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-button
	lazy-placeholder-inline()
	height: 36px

.-attachment-controls
	margin-bottom: $line-height-computed

	.-button
		width: 110px
		margin-left: 10px

	@media $media-xs
		white-space: nowrap
		overflow-x: scroll
		overflow-y: hidden

.-lead-form-group
	cursor: text
	color: var(--theme-fg-muted)
	change-bg('bg-offset')
	margin-bottom: 30px

	.form-control
		height: 84px

.-controls-attachments
	.-button
		width: 36px
		height: 36px
		img-circle()

.-controls-submit
	.-button
		width: 70px

@media $media-xs
	.-controls
		display: flex
		flex-direction: column

		&-attachments
			display: flex
			justify-content: center
			margin-bottom: $line-height-computed
			padding: 10px 0
			border-top: $border-width-base solid var(--theme-bg-subtle)
			border-bottom: $border-width-base solid var(--theme-bg-subtle)

			> :not(:first-child)
				margin-left: 10px

		&-submit-button
			float: right
			width: 155px

			.-button
				width: 100%

@media $media-sm-up
	.-controls
		display: flex
		flex-direction: row

		&-attachments
			flex: auto

		&-submit
			flex: none

</style>

<script lang="ts" src="./add-placeholder"></script>
