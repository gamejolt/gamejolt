<template>
	<section class="section" v-if="post">
		<div v-app-scroll-when="true" />

		<div class="container">
			<div v-if="post.hasVideo" class="full-bleed-xs">
				<app-video-embed video-provider="youtube" :video-id="post.videos[0].video_id" autoplay />
				<br />
			</div>

			<div class="row">
				<div class="col-sm-10 col-md-8 col-lg-7" :class="{ 'col-centered': Screen.isMobile }">
					<div class="post-view">
						<div class="-header">
							<div class="-user-info">
								<div class="-avatar">
									<app-user-card-hover :user="post.user" :disabled="Screen.isXs">
										<app-user-avatar class="-circle-img" :user="post.user" />
									</app-user-card-hover>
								</div>

								<div class="-content">
									<router-link :to="post.user.url" class="link-unstyled">
										<strong>{{ post.user.display_name }}</strong>
										<small class="text-muted">@{{ post.user.username }}</small>
									</router-link>

									<div class="social-widgets">
										<app-user-follow-widget
											v-if="!app.user || post.user.id !== app.user.id"
											:user="post.user"
											sm
											event-label="video-modal"
										/>
									</div>
								</div>
							</div>

							<router-link
								v-if="post.game && !Screen.isMobile"
								class="-game-details link-unstyled"
								:to="post.game.getUrl()"
							>
								<div class="-col">
									<div class="-title">
										{{ post.game.title }}
									</div>

									<div class="-dev text-muted">
										<translate>by</translate>
										<strong>{{ post.game.developer.display_name }}</strong>
									</div>

									<div class="-followers text-muted">
										<translate
											:translate-n="post.game.follower_count || 0"
											:translate-params="{ count: number(post.game.follower_count || 0) }"
											translate-plural="%{ count } followers"
										>
											%{ count } follower
										</translate>
									</div>
								</div>

								<app-media-item-backdrop
									class="-backdrop"
									:media-item="post.game.thumbnail_media_item"
									radius="lg"
								>
									<app-img-responsive class="-game-thumb" :src="post.game.img_thumbnail" />
								</app-media-item-backdrop>
							</router-link>
						</div>

						<div v-if="post.hasMedia" class="full-bleed-xs">
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
							<app-sketchfab-embed :sketchfab-id="post.sketchfabs[0].sketchfab_id" autoplay />
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

						<app-sticker-target
							:stickers="post.stickers"
							:show-stickers="stickersVisible"
							ref="stickerTarget"
							@hide-all="onAllStickersHidden"
						>
							<app-content-viewer :source="post.lead_content" />
						</app-sticker-target>

						<div v-if="post.hasArticle">
							<div class="page-cut" />

							<app-content-viewer :source="post.article_content" />
						</div>
					</div>

					<app-event-item-controls-overlay v-if="post.hasPoll">
						<app-poll-voting :poll="post.poll" :game="post.game" :user="post.user" />

						<br />
					</app-event-item-controls-overlay>

					<app-event-item-controls-overlay v-if="communities.length">
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
								<span
									><translate
										>You can't publish this post to the selected community channel because you don't
										have permissions to post into that specific channel. Please select a different
										channel.</translate
									></span
								>
							</div>
						</template>

						<br />
					</app-event-item-controls-overlay>

					<app-event-item-controls
						:post="post"
						show-comments
						should-show-follow
						:show-stickers="stickersVisible"
						@post-remove="onPostRemoved"
						@post-publish="onPostPublished"
						@post-stickers-visibility-change="onPostStickersVisibilityChange"
					/>
				</div>
				<div class="col-md-4 col-lg-5" v-if="shouldShowAds && Screen.isDesktop">
					<app-ad-widget size="rectangle" placement="side" class="pull-right" />
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

$-padding = 16px
$-image-width = 100px
$-spacing = 8px
$-width = 320px

.-header
	display: flex
	align-items: center
	margin-bottom: $-spacing
	overflow: hidden

	.-user-info
		clearfix()
		display: inline-flex
		flex: auto
		padding: $-padding
		padding-left: 0
		min-width: 0

		.-avatar
			change-bg('bg-subtle')
			img-circle()
			flex: none
			overflow: hidden
			width: 50px
			height: 50px

		.-content
			display: flex
			flex-flow: column
			margin-left: 10px
			min-width: 0

			*
				text-overflow()
				display: block

			a:hover
				text-decoration: none

				strong
					text-decoration: underline

		.social-widgets
			margin-top: 5px
			margin-bottom: 0

	.-game-details
		rounded-corners-lg()
		display: inline-flex
		flex: none
		margin-left: auto
		padding: $-padding
		transition: 200ms

		.-col
			display: flex
			flex-flow: column nowrap
			justify-content: space-between
			align-items: flex-end

			.-title, .-dev, .-followers
				display: block
				text-overflow()
				max-width: $-width - ($-image-width + $-spacing)

			.-title
				font-weight: 700

			.-dev, .-followers
				font-size: $font-size-small

		.-backdrop
			change-bg('bg-offset')
			width: $-image-width
			margin-left: $-spacing
			height: auto

		&:hover
			change-bg('bg-offset')
			text-decoration: none

			.-title
				text-decoration: underline

.-circle-img >>>
	img
		border-radius: 50% !important

.-backdrop
	change-bg('bg-offset')

.-media-item
	position: relative
	margin-left: auto
	margin-right: auto

.-img, .-video
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

<script lang="ts" src="./view"></script>
