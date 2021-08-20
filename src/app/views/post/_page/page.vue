<script lang="ts" src="./page"></script>

<template>
	<!--
	A lot of components on this page don't properly respond to inputs changing,
	so key on the post ID so that everything gets recompiled when switching
	posts.
	-->
	<section :key="post.id" class="-section section-thin">
		<template v-if="video">
			<div class="container-xl">
				<div class="full-bleed-xs">
					<template v-if="video.provider === 'gamejolt'">
						<app-video-player
							v-if="!video.is_processing && video.posterMediaItem"
							context="page"
							:media-item="video.posterMediaItem"
							:manifests="video.manifestSources"
							:view-count="video.view_count"
							:start-time="videoStartTime"
							autoplay
							show-video-stats
							@play="onVideoPlay"
						/>
						<template v-else>
							<app-video-processing-progress
								:post="post"
								@complete="onVideoProcessingComplete"
							/>
						</template>
					</template>
				</div>
			</div>
		</template>

		<app-page-container xl>
			<template #default>
				<template v-if="communityNotifications">
					<app-community-user-notification
						v-for="communityNotification of communityNotifications"
						:key="communityNotification.id"
						:notification="communityNotification"
						@dismiss="onDismissNotification(communityNotification)"
					/>
				</template>

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
								<app-user-card-hover :user="displayUser" :disabled="Screen.isXs">
									<app-user-avatar class="-circle-img" :user="displayUser" />
								</app-user-card-hover>
							</div>

							<router-link :to="displayUser.url" class="-name link-unstyled">
								<span>
									<strong>{{ displayUser.display_name }}</strong>
									<app-user-verified-tick :user="displayUser" />
								</span>
								<span class="tiny text-muted"> @{{ displayUser.username }} </span>
							</router-link>

							<div class="-controls">
								<app-user-follow-widget
									v-if="!user || displayUser.id !== user.id"
									:user="displayUser"
									hide-count
									location="postPage"
								/>
							</div>
						</div>
					</div>

					<!--
					Indicates where sticker placements may begin for scrolling when they show
					stickers.
					-->
					<div ref="sticker-scroll" />

					<div v-if="post.hasMedia" class="-media-items">
						<div v-for="item of post.media" :key="item.id">
							<app-media-item-post
								class="-media-item"
								:media-item="item"
								is-active
								can-place-sticker
								@fullscreen="onClickFullscreen"
							/>
							<br />
						</div>
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
						<span v-else-if="post.isDraft" class="tag" style="vertical-align: middle">
							<translate>Draft</translate>
						</span>
					</div>

					<app-sticker-target :controller="stickerTargetController">
						<app-content-viewer :source="post.lead_content" />
					</app-sticker-target>

					<app-fireside-post-embed
						v-for="embed of post.embeds"
						:key="embed.id"
						:embed="embed"
						:hide-outview="false"
					/>

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
					v-if="communities.length || post.sticker_counts.length"
				>
					<app-sticker-reactions
						v-if="post.sticker_counts.length"
						:controller="stickerTargetController"
						@show="scrollToStickers()"
					/>

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
									You can't publish this post to the selected community channel
									because you don't have permissions to post into that specific
									channel. Please select a different channel.
								</translate>
							</span>
						</div>
					</template>

					<div class="-controls-spacing" />
				</app-sticker-controls-overlay>

				<app-post-controls
					:post="post"
					should-show-follow
					location="postPage"
					event-label="page"
					@post-remove="onPostRemoved"
					@post-publish="onPostPublished"
					@sticker="scrollToStickers()"
				/>

				<div v-if="useShareCard" class="-share">
					<app-share-card resource="post" :url="post.url" offset-color />
				</div>

				<div v-if="Screen.isMobile">
					<app-post-page-recommendations :posts="recommendedPosts" />
				</div>

				<br />
				<br />
				<app-comment-widget-lazy :model="post" display-mode="comments" />
			</template>

			<template v-if="!Screen.isMobile" #right>
				<app-post-page-recommendations :posts="recommendedPosts" />
			</template>
		</app-page-container>
	</section>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../variables'
@import '../common'

.-controls-spacing
	padding-bottom: $-controls-spacing-xs

	@media $media-sm-up
		padding-bottom: $-controls-spacing

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

	@media $media-lg-up
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

.-media-item
	cursor: zoom-in

>>> .mention-avatar-img
	border-radius: 50% !important

.-communities
	white-space: nowrap

.-share
	margin-top: $line-height-computed * 1.5
</style>
