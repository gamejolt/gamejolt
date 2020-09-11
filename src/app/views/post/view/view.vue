<script lang="ts" src="./view"></script>

<template>
	<section v-if="post" class="section">
		<div v-app-scroll-when="true" />

		<div class="container">
			<div v-if="post.hasVideo" class="full-bleed-xs">
				<app-video-embed
					video-provider="youtube"
					:video-id="post.videos[0].video_id"
					autoplay
				/>
				<br />
			</div>

			<div class="-row">
				<!-- Left Sidebar -->
				<div v-if="!Screen.isXs" class="-content-left" />

				<!-- Main Content -->
				<div class="-content-main">
					<div class="post-view">
						<div class="-header">
							<!-- User Info -->
							<div class="-user-info">
								<div class="-avatar">
									<app-user-card-hover :user="post.user" :disabled="Screen.isXs">
										<app-user-avatar class="-circle-img" :user="post.user" />
									</app-user-card-hover>
								</div>

								<router-link :to="post.user.url" class="-name link-unstyled">
									<strong>{{ post.user.display_name }}</strong>
									<span class="tiny text-muted"> @{{ post.user.username }} </span>
								</router-link>

								<div class="-controls social-widgets">
									<app-user-follow-widget
										v-if="!app.user || post.user.id !== app.user.id"
										:user="post.user"
										hide-count
										event-label="post-view"
									/>
								</div>
							</div>
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

						<app-sticker-target
							ref="stickerTarget"
							:stickers="post.stickers"
							:show-stickers="stickersVisible"
							@hide-all="onAllStickersHidden"
						>
							<app-content-viewer :source="post.lead_content" />
						</app-sticker-target>

						<app-game-badge v-if="post.game" :game="post.game" large />

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
								<span>
									<translate>
										You can't publish this post to the selected community
										channel because you don't have permissions to post into that
										specific channel. Please select a different channel.
									</translate>
								</span>
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

				<!-- Right Sidebar -->
				<div v-if="!Screen.isXs" class="-content-right" />
			</div>
		</div>
	</section>
</template>

<style lang="stylus" src="./view.styl" scoped></style>
