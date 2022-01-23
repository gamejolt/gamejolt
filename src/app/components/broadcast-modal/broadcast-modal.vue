<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppContentViewer from '../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../_common/environment/environment.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { $viewPostVideo } from '../../../_common/fireside/post/video/video-model';
import { AppImgResponsive } from '../../../_common/img/responsive/responsive';
import { MediaItem } from '../../../_common/media-item/media-item-model';
import { BaseModal } from '../../../_common/modal/base';
import { AppResponsiveDimensions } from '../../../_common/responsive-dimensions/responsive-dimensions';
import {
	createStickerTargetController,
	StickerTargetController,
} from '../../../_common/sticker/target/target-controller';
import AppStickerTarget from '../../../_common/sticker/target/target.vue';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import AppVideoEmbed from '../../../_common/video/embed/embed.vue';
import { getVideoPlayerFromSources } from '../../../_common/video/player/controller';
import AppVideoPlayer from '../../../_common/video/player/player.vue';
import AppVideo from '../../../_common/video/video.vue';
import { AppCommentWidgetLazy } from '../lazy';
import AppPollVoting from '../poll/voting/voting.vue';
import AppPostControls from '../post/controls/controls.vue';

@Options({
	components: {
		AppResponsiveDimensions,
		AppImgResponsive,
		AppVideo,
		AppVideoEmbed,
		AppVideoPlayer,
		AppTimeAgo,
		AppPollVoting,
		AppPostControls,
		AppContentViewer,
		AppStickerTarget,
		AppCommentWidgetLazy,
	},
})
export default class AppBroadcastModal extends mixins(BaseModal) {
	@Prop({ type: Array, required: true })
	posts!: FiresidePost[];

	post: FiresidePost = this.posts[0];
	stickerTargetController!: StickerTargetController;

	readonly Environment = Environment;

	get video() {
		return this.post.videos[0];
	}

	created() {
		this.stickerTargetController = createStickerTargetController(this.post);
	}

	getVideoController(item: MediaItem) {
		const sources = {
			mp4: item.mediaserver_url_mp4,
			webm: item.mediaserver_url_webm,
		};
		return getVideoPlayerFromSources(sources, 'gif', item.mediaserver_url);
	}

	onVideoPlay() {
		if (this.video) {
			$viewPostVideo(this.video);
		}
	}
}
</script>

<template>
	<app-modal ref="modal">
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
							v-for="_post of posts"
							:key="_post.id"
							class="list-group-item has-icon"
							@click="post = _post"
						>
							<h5 class="list-group-item-heading">
								<app-jolticon v-if="post.id === _post.id" icon="chevron-right" />

								{{ _post.getShortLead() }}

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
							<app-responsive-dimensions
								class="-media-item"
								:ratio="item.width / item.height"
							>
								<app-img-responsive
									v-if="!item.is_animated"
									class="-img"
									:src="item.mediaserver_url"
									alt=""
								/>

								<app-video
									v-else
									class="-video"
									:player="getVideoController(item)"
									:show-loading="true"
								/>
							</app-responsive-dimensions>

							<br />
						</div>
					</div>

					<div v-if="post.hasVideo">
						<app-video-player
							v-if="video.provider === 'gamejolt'"
							context="page"
							:media-item="video.posterMediaItem"
							:manifests="video.manifestSources"
							autoplay
							@play="onVideoPlay"
						/>
						<app-video-embed
							v-else
							video-provider="youtube"
							:video-id="video.video_id"
							autoplay
						/>

						<br />
					</div>

					<div class="tiny text-muted">
						<app-time-ago v-if="post.isActive" :date="post.published_on" />
					</div>

					<app-sticker-target :controller="stickerTargetController">
						<app-content-viewer :source="post.lead_content" />
					</app-sticker-target>

					<div v-if="post.has_article">
						<div class="page-cut" />

						<app-content-viewer :source="post.article_content" />
					</div>

					<template v-if="post.hasPoll">
						<app-poll-voting :poll="post.poll" :game="post.game" :user="post.user" />

						<br />
					</template>

					<app-post-controls :post="post" location="broadcast" event-label="broadcast" />

					<br />
					<br />
					<app-comment-widget-lazy :model="post" display-mode="comments" />
				</div>
			</div>
		</div>
	</app-modal>
</template>
