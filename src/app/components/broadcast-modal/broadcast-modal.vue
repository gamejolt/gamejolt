<template>
	<app-modal>
		<div class="modal-controls">
			<app-button @click="modal.dismiss()">
				<translate>Close</translate>
			</app-button>
		</div>

		<div class="modal-header">
			<h1 class="text-center section-header">
				<translate>We've built some new stuff!</translate>
			</h1>

			<p class="small text-center">
				<translate>Constantly improving for your enjoyment. Be enjoyed!</translate>
			</p>
		</div>

		<hr />

		<div class="modal-body">
			<div class="row">
				<div class="col-sm-4 col-sm-push-8">
					<div class="list-group">
						<a
							class="list-group-item has-icon"
							v-for="_post of posts"
							:key="_post.id"
							@click="post = _post"
						>
							<h5 class="list-group-item-heading">
								<app-jolticon v-if="post.id === _post.id" icon="chevron-right" />

								{{ _post.lead_snippet }}

								<div class="tiny text-muted">
									<app-time-ago :date="_post.published_on" />
								</div>
							</h5>
						</a>
					</div>
				</div>
				<div class="col-sm-8 col-sm-pull-4">
					<div v-if="post.hasMedia">
						<div v-for="item of post.media" :key="item.id">
							<app-responsive-dimensions class="-media-item" :ratio="item.width / item.height">
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
									:show-loading="true"
								/>
							</app-responsive-dimensions>

							<br />
						</div>
					</div>

					<div v-if="post.hasVideo">
						<app-video-embed
							video-provider="youtube"
							:video-id="post.videos[0].video_id"
							:autoplay="true"
						/>

						<br />
					</div>

					<!-- No need for sketchfab -->

					<div class="tiny text-muted">
						<app-time-ago v-if="post.isActive" :date="post.published_on" />
					</div>

					<app-content-viewer :source="post.lead_content" />

					<div v-if="post.hasArticle">
						<div class="page-cut" />

						<app-content-viewer :source="post.article_content" />
					</div>

					<template v-if="post.hasPoll">
						<app-poll-voting :poll="post.poll" :game="post.game" />

						<br />
					</template>

					<app-event-item-controls show-comments :post="post" />
				</div>
			</div>
		</div>
	</app-modal>
</template>

<script lang="ts" src="./broadcast-modal"></script>
