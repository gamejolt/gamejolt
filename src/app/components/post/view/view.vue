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
						<div v-if="post.hasMedia" class="full-bleed-xs">
							<div v-for="item of post.media" :key="item.id">
								<app-responsive-dimensions
									class="-media-item"
									:ratio="item.width / item.height"
									:max-width="item.width"
								>
									<app-event-item-media-tags :gif="item.is_animated" />
									<app-media-item-backdrop
										class="-backdrop"
										:media-item="item"
										:radius="Screen.isXs ? null : 'lg'"
									>
										<app-img-responsive
											class="-img"
											v-if="!item.is_animated"
											:src="item.mediaserver_url"
											alt=""
										/>

										<app-video
											v-else
											class="-video"
											:poster="item.mediaserver_url"
											:webm="item.mediaserver_url_webm"
											:mp4="item.mediaserver_url_mp4"
											show-loading
										/>
									</app-media-item-backdrop>
								</app-responsive-dimensions>

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
						>
							<app-content-viewer :source="post.lead_content" />
						</app-sticker-target>

						<div v-if="post.hasArticle">
							<div class="page-cut" />

							<app-content-viewer :source="post.article_content" />
						</div>
					</div>

					<template v-if="post.hasPoll">
						<app-poll-voting :poll="post.poll" :game="post.game" :user="post.user" />

						<br />
					</template>

					<template v-if="communities.length">
						<div
							class="-community-row"
							v-for="postCommunity of communities"
							:key="postCommunity.id"
						>
							<app-community-pill
								:community="postCommunity.community"
								:channel="postCommunity.channel"
							/>
						</div>

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
					</template>

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

.-media-item
	position: relative
	margin-left: auto
	margin-right: auto

	.-backdrop
		change-bg('bg-offset')

.-img, .-video
	width: 100%
	height: 100%

@media $media-sm-up
	.post-view >>>
		iframe
			rounded-corners-lg()

>>> .mention-avatar-img
	border-radius: 50% !important

.-community-row
	display: flex
	align-items: center
</style>

<script lang="ts" src="./view"></script>
