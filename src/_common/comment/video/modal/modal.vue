<template>
	<app-modal :theme="user.theme">
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-body">
			<div class="fill-darkest full-bleed">
				<app-responsive-dimensions :ratio="16 / 9">
					<app-video-embed
						v-if="video"
						video-provider="youtube"
						:video-id="video.video_id"
						:autoplay="true"
					/>
				</app-responsive-dimensions>
			</div>

			<br />

			<div class="row">
				<div class="col-sm-8">
					<h2 class="section-header">
						{{ video.title }}
					</h2>

					<app-comment-video-like-widget :video="video" />

					<hr />

					<div class="clearfix">
						<div class="-user-info">
							<div class="-avatar">
								<app-user-card-hover :user="user">
									<app-user-avatar :user="user" />
								</app-user-card-hover>
							</div>
							<div class="-content">
								<div>
									<router-link :to="user.url" class="link-unstyled">
										<strong>{{ user.display_name }}</strong>
										<small class="text-muted">@{{ user.username }}</small>
									</router-link>
								</div>

								<div class="social-widgets">
									<app-user-follow-widget
										v-if="!app.user || user.id !== app.user.id"
										:user="user"
										sm
										event-label="video-modal"
									/>
								</div>
							</div>
						</div>
					</div>

					<br />

					<app-content-viewer :source="comment.comment_content" />
				</div>
				<div class="col-sm-4">
					<div class="visible-xs">
						<h3 :class="{ 'section-header': Screen.isDesktop }">
							<translate>Game in Video</translate>
						</h3>
						<hr class="underbar" />
					</div>

					<app-game-thumbnail :game="game" />
				</div>
			</div>
		</div>
	</app-modal>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-user-info
	clearfix()

	.-avatar
		float: left
		width: 50px

	.-content
		float: left
		margin-left: 10px

	.social-widgets
		margin-top: 5px
		margin-bottom: 0
</style>

<script lang="ts" src="./modal"></script>
