<template>
	<div>
		<app-fade-collapse
			:collapse-height="375"
			:is-open="showFullContent"
			@require-change="canToggleContent = $event"
			@expand="showFullContent = true"
		>
			<app-content-viewer :source="content" />

			<p class="text-muted small" v-if="comment.modified_on">
				<b><translate>Last modified on</translate></b>
				<span :title="date(comment.modified_on, 'medium')">
					{{ comment.modified_on | date('longDate') }}
				</span>
			</p>
		</app-fade-collapse>

		<a
			class="hidden-text-expander"
			v-if="canToggleContent"
			@click="showFullContent = !showFullContent"
			v-app-track-event="`comment-widget:toggle-full-content`"
		></a>

		<div class="-videos" v-if="comment.videos.length">
			<div class="row">
				<div
					class="col-xs-6 col-sm-4"
					v-for="video of comment.videos.slice(0, showAllVideos ? 10 : 2)"
					:key="video.id"
				>
					<app-comment-video-thumbnail :video="video" />
				</div>
			</div>

			<p v-if="comment.videos.length > 2 && !showAllVideos">
				<a
					class="small link-muted"
					@click="showAllVideos = true"
					v-app-track-event="`comment-widget:more-videos`"
				>
					<translate
						:translate-n="comment.videos.length - 2"
						:translate-params="{ count: comment.videos.length - 2 }"
						translate-plural="+%{ count } more videos"
					>
						+%{ count } more video
					</translate>
				</a>
			</p>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.hidden-text-expander
	margin-bottom: $font-size-base

.-videos
	margin-top: 3px // the extra spacing looked nice

.comment-video-thumbnail
	margin-bottom: $line-height-computed !important
</style>

<script lang="ts" src="./content"></script>
