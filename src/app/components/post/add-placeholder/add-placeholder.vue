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

			<!-- HP -->
			<div class="-hp">
				<div class="-hp-text" />
				<div class="-hp-bar" />
			</div>
		</div>

		<!-- Communities -->
		<div class="-community">
			<div class="-community-pill" />
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
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../../forms/community/_pill/variables'

.-hp
	display: flex
	align-items: center
	height: 18px
	margin-top: 5px

	&-text
		change-bg('bg-subtle')
		rounded-corners()
		width: 18px
		height: 18px
		margin-right: 10px

	&-bar
		change-bg('bg-subtle')
		rounded-corners()
		width: 100%
		height: 5px

.-community
	height: 32px
	margin: 10px 0

	&-pill
		change-bg('bg-subtle')
		rounded-corners()
		height: $pill-height
		width: 138px

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
	margin-bottom: 10px

	.form-control
		height: 95px

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
			width: 50%
			padding-left: 10px

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
