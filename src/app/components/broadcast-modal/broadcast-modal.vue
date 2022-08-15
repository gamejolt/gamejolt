<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import AppContentViewer from '../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../_common/environment/environment.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { $viewPostVideo } from '../../../_common/fireside/post/video/video-model';
import AppImgResponsive from '../../../_common/img/AppImgResponsive.vue';
import { MediaItem } from '../../../_common/media-item/media-item-model';
import { BaseModal } from '../../../_common/modal/base';
import AppResponsiveDimensions from '../../../_common/responsive-dimensions/AppResponsiveDimensions.vue';
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
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				<AppTranslate>Close</AppTranslate>
			</AppButton>
		</div>

		<div class="modal-header">
			<h1 class="text-center section-header">
				<AppTranslate>We've built some new stuff!</AppTranslate>
			</h1>

			<p class="small text-center">
				<AppTranslate>Constantly improving for your enjoyment. Be enjoyed!</AppTranslate>
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
								<AppJolticon v-if="post.id === _post.id" icon="chevron-right" />

								{{ _post.getShortLead() }}

								<div class="tiny text-muted">
									<AppTimeAgo :date="_post.published_on" />
								</div>
							</h5>
						</a>
					</div>
				</div>
				<div class="col-sm-8 col-sm-pull-4">
					<div v-if="post.hasMedia">
						<div v-for="item of post.media" :key="item.id">
							<AppResponsiveDimensions
								class="-media-item"
								:ratio="item.width / item.height"
							>
								<AppImgResponsive
									v-if="!item.is_animated"
									class="-img"
									:src="item.mediaserver_url"
									alt=""
								/>

								<AppVideo
									v-else
									class="-video"
									:player="getVideoController(item)"
									:show-loading="true"
								/>
							</AppResponsiveDimensions>

							<br />
						</div>
					</div>

					<div v-if="post.hasVideo">
						<AppVideoPlayer
							v-if="video.provider === 'gamejolt'"
							context="page"
							:media-item="video.posterMediaItem"
							:manifests="video.manifestSources"
							autoplay
							@play="onVideoPlay"
						/>
						<AppVideoEmbed
							v-else
							video-provider="youtube"
							:video-id="video.video_id"
							autoplay
						/>

						<br />
					</div>

					<div class="tiny text-muted">
						<AppTimeAgo v-if="post.isActive" :date="post.published_on" />
					</div>

					<AppStickerTarget :controller="stickerTargetController">
						<AppContentViewer :source="post.lead_content" />
					</AppStickerTarget>

					<div v-if="post.has_article">
						<div class="page-cut" />

						<AppContentViewer :source="post.article_content" />
					</div>

					<template v-if="post.hasPoll">
						<AppPollVoting :poll="post.poll" :game="post.game" :user="post.user" />

						<br />
					</template>

					<AppPostControls :post="post" location="broadcast" event-label="broadcast" />

					<br />
					<br />
					<AppCommentWidgetLazy :model="post" display-mode="comments" />
				</div>
			</div>
		</div>
	</AppModal>
</template>
