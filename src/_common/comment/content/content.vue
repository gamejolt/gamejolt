<script lang="ts" src="./content"></script>

<template>
	<div>
		<app-sticker-target :model="comment">
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
						{{ comment.modified_on | date('longDate') }}
					</span>
				</p>
			</app-fade-collapse>

			<a
				v-if="canToggleContent"
				v-app-track-event="`comment-widget:toggle-full-content`"
				class="hidden-text-expander"
				@click="showFullContent = !showFullContent"
			/>

			<div v-if="comment.videos.length" class="-videos">
				<div class="row">
					<div
						v-for="video of comment.videos.slice(0, showAllVideos ? 10 : 2)"
						:key="video.id"
						class="col-xs-6 col-sm-4"
					>
						<app-comment-video-thumbnail :video="video" />
					</div>
				</div>

				<p v-if="comment.videos.length > 2 && !showAllVideos">
					<a
						v-app-track-event="`comment-widget:more-videos`"
						class="small link-muted"
						@click="showAllVideos = true"
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
		</app-sticker-target>

		<app-sticker-reactions v-if="comment.sticker_counts" :model="comment" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.hidden-text-expander
	margin-bottom: $font-size-base

.-videos
	margin-top: 3px // the extra spacing looked nice

.comment-video-thumbnail
	margin-bottom: $line-height-computed !important
</style>
