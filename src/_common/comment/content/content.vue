<script lang="ts" src="./content"></script>

<template>
	<div>
		<app-sticker-target :controller="stickerTargetController" :disabled="!canPlaceStickers">
			<app-fade-collapse
				:collapse-height="375"
				:is-open="showFullContent"
				@require-change="canToggleContent = $event"
				@expand="showFullContent = true"
			>
				<app-content-viewer :source="content" />

				<p v-if="comment.modified_on" class="text-muted small">
					<b><translate>Last modified on</translate></b>
					<span :title="date(comment.modified_on, 'medium')">
						{{ date(comment.modified_on, 'longDate') }}
					</span>
				</p>
			</app-fade-collapse>

			<a
				v-if="canToggleContent"
				v-app-track-event="`comment-widget:toggle-full-content`"
				class="hidden-text-expander"
				@click="showFullContent = !showFullContent"
			/>
		</app-sticker-target>

		<app-sticker-controls-overlay
			v-if="comment.sticker_counts.length"
			class="-reactions-container"
		>
			<app-sticker-reactions :controller="stickerTargetController" />
		</app-sticker-controls-overlay>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

$-reactions-padding = ($grid-gutter-width / 2) * 0.75
$-reactions-padding-xs = ($grid-gutter-width-xs / 2) * 0.75

.hidden-text-expander
	margin-bottom: $font-size-base

.-reactions-container
	padding-bottom: $-reactions-padding-xs

	@media $media-sm-up
		padding-bottom: $-reactions-padding
</style>
