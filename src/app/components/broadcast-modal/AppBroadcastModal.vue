<script lang="ts" setup>
import { computed } from 'vue';

import AppPollVoting from '~app/components/poll/AppPollVoting.vue';
import AppPostControls from '~app/components/post/controls/AppPostControls.vue';
import AppButton from '~common/button/AppButton.vue';
import AppContentViewer from '~common/content/content-viewer/AppContentViewer.vue';
import { FiresidePostModel } from '~common/fireside/post/post-model';
import { $viewPostVideo } from '~common/fireside/post/video/video-model';
import AppImgResponsive from '~common/img/AppImgResponsive.vue';
import { MediaItemModel } from '~common/media-item/media-item-model';
import AppModal from '~common/modal/AppModal.vue';
import { useModal } from '~common/modal/modal.service';
import AppResponsiveDimensions from '~common/responsive-dimensions/AppResponsiveDimensions.vue';
import AppStickerTarget from '~common/sticker/target/AppStickerTarget.vue';
import { createStickerTargetController } from '~common/sticker/target/target-controller';
import AppTimeAgo from '~common/time/AppTimeAgo.vue';
import AppVideo from '~common/video/AppVideo.vue';
import AppVideoPlayer from '~common/video/player/AppVideoPlayer.vue';
import { getVideoPlayerFromSources } from '~common/video/player/controller';

type Props = {
	posts: FiresidePostModel[];
};
const { posts } = defineProps<Props>();
const modal = useModal()!;

const post = computed(() => posts[0]);
const stickerTargetController = createStickerTargetController(post.value, {
	canReceiveCharge: () => post.value.can_receive_charged_stickers,
});

const video = computed(() => post.value.videos[0]);

function getVideoController(item: MediaItemModel) {
	const sources = {
		mp4: item.mediaserver_url_mp4,
		webm: item.mediaserver_url_webm,
	};
	return getVideoPlayerFromSources(sources, 'gif', item.mediaserver_url);
}

function onVideoPlay() {
	if (video.value) {
		$viewPostVideo(video.value);
	}
}
</script>

<template>
	<AppModal>
		<div class="modal-controls">
			<AppButton @click="modal.dismiss()">
				{{ $gettext(`Close`) }}
			</AppButton>
		</div>

		<div class="modal-header">
			<h1 class="text-center section-header">
				{{ $gettext(`We've built some new stuff!`) }}
			</h1>

			<p class="small text-center">
				{{ $gettext(`Constantly improving for your enjoyment. Be enjoyed!`) }}
			</p>
		</div>

		<hr />

		<div class="modal-body">
			<div v-if="post.hasMedia">
				<div v-for="item of post.media" :key="item.id">
					<AppResponsiveDimensions class="-media-item" :ratio="item.width / item.height">
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
					context="page"
					:media-item="video.posterMediaItem!"
					:manifests="video.manifestSources"
					autoplay
					@play="onVideoPlay"
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
				<AppPollVoting :post="post" :poll="post.poll!" />

				<br />
			</template>

			<AppPostControls :post="post" location="broadcast" />
		</div>
	</AppModal>
</template>
