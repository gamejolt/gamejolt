<script lang="ts" src="./page"></script>

<template>
	<section class="-section section-thin">
		<div class="container-xl">
			<template v-if="video">
				<div class="full-bleed-xs">
					<template v-if="video.provider === 'gamejolt'">
						<app-responsive-dimensions
							v-if="!video.is_processing && video.posterMediaItem"
							class="-responsive"
							:ratio="video.posterMediaItem.width / video.posterMediaItem.height"
							:max-width="video.posterMediaItem.width"
							:max-height="deviceMaxHeight"
							@change="onPlayerSizeChange"
						>
							<app-video-player
								:class="{ '-filled': Screen.isXs && isPlayerFilled }"
								context="page"
								:poster="video.posterUrl"
								:manifests="video.manifestUrls"
								:start-time="videoStartTime"
								autoplay
								@play="onVideoPlay"
							/>
							<div class="-video-stats">
								<span v-app-tooltip.touchable="$gettext(`Plays`)">
									<app-jolticon icon="play" />
									<span class="-video-stats-label">
										{{ number(video.view_count) }}
									</span>
								</span>
							</div>
						</app-responsive-dimensions>
						<template v-else>
							<app-video-processing-progress
								:post="post"
								@complete="onProcessingComplete"
							/>
						</template>
					</template>
					<app-video-embed
						v-else
						class="-video"
						video-provider="youtube"
						:video-id="video.video_id"
						autoplay
					/>
				</div>
			</template>

			<div class="-row">
				<!-- Left Sidebar -->
				<div v-if="!Screen.isXs" class="-content-left" />

				<!-- Main Content -->
				<div class="-content-main">
					<div class="post-view">
						<app-game-badge
							v-if="post.game"
							class="-game-badge"
							:game="post.game"
							full-bleed
						/>

						<div>
							<!-- User Info -->
							<div class="-user-info">
								<div class="-avatar">
									<app-user-card-hover
										:user="displayUser"
										:disabled="Screen.isXs"
									>
										<app-user-avatar class="-circle-img" :user="displayUser" />
									</app-user-card-hover>
								</div>

								<router-link :to="displayUser.url" class="-name link-unstyled">
									<span>
										<strong>{{ displayUser.display_name }}</strong>
										<app-user-verified-tick :user="displayUser" />
									</span>
									<span class="tiny text-muted">
										@{{ displayUser.username }}
									</span>
								</router-link>

								<div class="-controls">
									<app-user-follow-widget
										v-if="!user || displayUser.id !== user.id"
										:user="displayUser"
										hide-count
										event-label="post-view"
									/>
								</div>
							</div>
						</div>

						<div v-if="post.hasMedia" class="-media-items">
							<div v-for="item of post.media" :key="item.id">
								<app-media-item-post
									class="-media-item"
									:media-item="item"
									is-active
									@fullscreen="onClickFullscreen"
								/>
								<br />
							</div>
						</div>

						<div v-if="post.hasSketchfab" class="full-bleed-xs">
							<app-sketchfab-embed
								:sketchfab-id="post.sketchfabs[0].sketchfab_id"
								autoplay
							/>
						</div>

						<div class="tiny text-muted">
							<app-time-ago v-if="post.isActive" :date="post.published_on" strict />
							<template v-else-if="post.isScheduled">
								<span class="tag" style="vertical-align: middle">
									<app-jolticon icon="calendar-grid" />
									<translate>Scheduled</translate>
								</span>
								<app-time-ago :date="post.scheduled_for" strict without-suffix />
							</template>
							<span
								v-else-if="post.isDraft"
								class="tag"
								style="vertical-align: middle"
							>
								<translate>Draft</translate>
							</span>
						</div>

						<app-sticker-target :controller="stickerTargetController">
							<app-content-viewer :source="post.lead_content" />
						</app-sticker-target>

						<div v-if="post.has_article">
							<div class="page-cut" />

							<template v-if="!post.hasArticleContent">
								<span class="lazy-placeholder" />
								<span class="lazy-placeholder" />
								<p>
									<span class="lazy-placeholder" style="width: 70%" />
								</p>
							</template>
							<app-content-viewer v-else :source="post.article_content" />
						</div>
					</div>

					<app-sticker-controls-overlay v-if="post.hasPoll">
						<app-poll-voting :poll="post.poll" :game="post.game" :user="post.user" />

						<br />
					</app-sticker-controls-overlay>

					<app-sticker-controls-overlay
						v-if="communities.length || post.sticker_counts"
					>
						<app-scroll-scroller class="-communities" horizontal thin>
							<app-community-pill
								v-for="postCommunity of communities"
								:key="postCommunity.id"
								:community-link="postCommunity"
							/>
						</app-scroll-scroller>

						<template v-if="shouldShowCommunityPublishError">
							<br />
							<div class="well fill-offset">
								<app-jolticon icon="notice" notice />
								<span>
									<translate>
										You can't publish this post to the selected community
										channel because you don't have permissions to post into that
										specific channel. Please select a different channel.
									</translate>
								</span>
							</div>
						</template>

						<app-sticker-reactions
							v-if="post.sticker_counts.length"
							:controller="stickerTargetController"
						/>

						<br />
					</app-sticker-controls-overlay>

					<app-event-item-controls
						:post="post"
						should-show-follow
						event-label="page"
						@post-remove="onPostRemoved"
						@post-publish="onPostPublished"
					/>

					<br />
					<br />
					<app-comment-widget-lazy :model="post" display-mode="comments" />
				</div>

				<!-- Right Sidebar -->
				<div v-if="!Screen.isXs" class="-content-right" />
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../variables'
@import '../common'

.-row
	display: flex

	.-content-left
	.-content-right
		flex: 1

	.-content-main
		min-width: 0

		@media $media-xs
			margin: 0
			flex: auto

		@media $media-sm-up
			margin: 0 $grid-gutter-width
			flex-shrink: 1
			flex-basis: $-center-col-max-width

.-responsive
	margin: 0 auto 8px + $line-height-computed

.-filled
	border-radius: 0 !important

.-video-stats
	display: flex
	justify-content: flex-end
	margin-top: 8px
	font-weight: bold

	> span
		display: inline-flex
		align-items: center

		@media $media-xs
			margin-right: ($grid-gutter-width-xs / 2)

	&-label
		margin-left: 4px

.-game-badge
	margin-top: $-spacing
	margin-bottom: 0

	@media $media-sm-up
		margin-bottom: $-spacing

.-name
	margin-right: auto
	min-width: 0

	> *
		text-overflow()
		display: block

	&:hover
		text-decoration: none

		strong
			text-decoration: underline

.-controls
	flex: none
	margin-left: 12px

.-circle-img >>>
	img
		border-radius: 50% !important

.-backdrop
	change-bg('bg-offset')

.-media-items
	full-bleed-xs()

	@media $media-md-up
		margin-left: -50px
		margin-right: -50px

.-media-item
	position: relative
	margin-left: auto
	margin-right: auto

.-img
.-video
	width: 100%
	height: 100%

@media $media-sm-up
	.post-view >>>
		iframe
			rounded-corners-lg()

.-media-item
	cursor: zoom-in

>>> .mention-avatar-img
	border-radius: 50% !important

.-communities
	white-space: nowrap
</style>
