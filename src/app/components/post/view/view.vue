<template>
	<section class="section" v-if="post">
		<div v-app-scroll-when="true"></div>
		<div class="container">
			<div v-if="post.hasVideo" class="full-bleed-xs">
				<app-video-embed
					video-provider="youtube"
					:video-id="post.videos[0].video_id"
					:autoplay="true"
				/>

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

						<app-content-viewer :source="post.lead_content" />

						<div v-if="post.hasArticle">
							<div class="page-cut" />

							<app-content-viewer :source="post.article_content" />
						</div>
					</div>

					<template v-if="post.hasPoll">
						<app-poll-voting :poll="post.poll" :game="post.game" />

						<br />
					</template>

					<template v-if="communities.length">
						<div>
							<app-community-pill v-for="i of communities" :key="i.id" :community="i.community" />
						</div>

						<br />
					</template>

					<div class="well fill-offset full-bleed-xs" v-if="shouldShowManage">
						<app-fireside-post-manage :post="post" show-community-controls />
					</div>

					<app-event-item-controls show-comments :post="post" />
				</div>
				<div class="col-md-4 col-lg-5" v-if="relevantUsers && Screen.isDesktop">
					<h4 class="section-header">
						<translate>Relevant People</translate>
					</h4>
					<div v-for="user of relevantUsers" :key="user.id">
						<router-link
							:to="{ name: 'profile.overview', params: { username: user.username } }"
							class="relevant-user"
						>
							<hr />
							<div class="relevant-user-info">
								<app-user-card-hover :user="user">
									<app-user-avatar class="relevant-user-avatar" :user="user" />
								</app-user-card-hover>
								<div class="relevant-user-content">
									<div>
										<strong>{{ user.display_name }}</strong>
										<app-jolticon v-if="user.is_verified" icon="verified" />
									</div>
									<div>
										<span class="text-muted">@{{ user.username }}</span>
										<small v-if="user.follows_you" class="text-muted relevant-user-follows-you">
											<translate>Follows you</translate>
										</small>
									</div>
								</div>
								<div class="relevant-user-follow">
									<app-user-follow-widget :user="user" hide-count />
								</div>
							</div>
						</router-link>
					</div>
				</div>
				<div class="col-md-4 col-lg-5" v-if="shouldShowAds && Screen.isDesktop">
					<app-ad-widget class="pull-right" pos="top" />
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-media-item
	theme-prop('background-color', 'bg-offset')
	position: relative
	margin-left: auto
	margin-right: auto

.-img, .-video
	width: 100%
	height: 100%

@media $media-sm-up
	.post-view >>>
		.-media-item, img, video, iframe
			rounded-corners()

>>> .mention-avatar-img
	border-radius: 50% !important

.relevant-user
	display: block

.relevant-user-info
	display: flex

.relevant-user-avatar
	width: 44px
	flex-grow: 0
	flex-shrink: 0
	margin-right: 16px

.relevant-user-content
	flex-grow: 1

.relevant-user-follow
	height: 100%
	flex-grow: 0
	flex-shrink: 0

.relevant-user-follows-you
	theme-prop('background-color', 'bg-offset')
	padding-left: 3px
	padding-right: 3px
	padding-top: 1px
	padding-bottom: 1px
	rounded-corners()
	margin-left: 4px

</style>

<script lang="ts" src="./view"></script>
