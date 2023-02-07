<script lang="ts" setup>
import { CONTENT_TARGET_HEIGHT } from '../../content/target/AppContentTarget.vue';
</script>

<template>
	<div>
		<!-- Attachments -->
		<div class="-attachment-controls">
			<div class="-button" />
			<div class="-button" />
			<div class="-button" />
		</div>

		<!-- Post title (short) -->
		<div class="form-group -lead-form-group">
			<div class="form-control" />

			<!-- HP -->
			<div class="-hp">
				<div class="-hp-text" />
				<div class="-hp-bar" />
			</div>
		</div>

		<!-- Content targets -->
		<div class="-content-targets">
			<div class="-content-targets-pill" :style="{ height: CONTENT_TARGET_HEIGHT + 'px' }" />
		</div>

		<!-- Controls -->
		<div class="-controls">
			<div class="-controls-attachments">
				<div class="-button" />
				<div class="-button" />
				<div class="-button" />
				<div class="-button" />
			</div>

			<div class="-controls-submit">
				<div class="-controls-submit-button">
					<div class="-button" />
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-hp
	display: flex
	align-items: center
	height: 18px
	margin-top: 5px

.-hp-text
	change-bg('bg-subtle')
	rounded-corners()
	width: 18px
	height: 18px
	margin-right: 10px

.-hp-bar
	change-bg('bg-subtle')
	rounded-corners()
	width: 100%
	height: 5px

.-content-targets
	height: 32px
	margin: 10px 0

.-content-targets-pill
	change-bg('bg-subtle')
	rounded-corners()
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

	.-controls-attachments
		display: flex
		justify-content: center
		margin-bottom: $line-height-computed
		padding: 10px 0
		border-top: $border-width-base solid var(--theme-bg-subtle)
		border-bottom: $border-width-base solid var(--theme-bg-subtle)

		> :not(:first-child)
			margin-left: 10px

	.-controls-submit-button
		float: right
		width: 50%
		padding-left: 10px

		.-button
			width: 100%

@media $media-sm-up
	.-controls
		display: flex
		flex-direction: row

	.-controls-attachments
		flex: auto

	.-controls-submit
		flex: none
</style>
