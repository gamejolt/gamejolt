<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppButton from '../../../_common/button/AppButton.vue';
import AppContentViewer from '../../../_common/content/content-viewer/AppContentViewer.vue';
import { FiresidePostModel } from '../../../_common/fireside/post/post-model';
import { $viewPostVideo } from '../../../_common/fireside/post/video/video-model';
import AppImgResponsive from '../../../_common/img/AppImgResponsive.vue';
import { MediaItemModel } from '../../../_common/media-item/media-item-model';
import AppModal from '../../../_common/modal/AppModal.vue';
import { useModal } from '../../../_common/modal/modal.service';
import AppResponsiveDimensions from '../../../_common/responsive-dimensions/AppResponsiveDimensions.vue';
import AppStickerTarget from '../../../_common/sticker/target/AppStickerTarget.vue';
import { createStickerTargetController } from '../../../_common/sticker/target/target-controller';
import AppTimeAgo from '../../../_common/time/AppTimeAgo.vue';
import AppVideo from '../../../_common/video/AppVideo.vue';
import AppVideoPlayer from '../../../_common/video/player/AppVideoPlayer.vue';
import { getVideoPlayerFromSources } from '../../../_common/video/player/controller';
import AppPollVoting from '../poll/AppPollVoting.vue';
import AppPostControls from '../post/controls/AppPostControls.vue';

const props = defineProps({
	posts: {
		type: Array as PropType<FiresidePostModel[]>,
		required: true,
	},
});

const { posts } = toRefs(props);
const modal = useModal()!;

const post = computed(() => posts.value[0]);
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

			<AppPostControls :post="post" location="broadcast" event-label="broadcast" />
		</div>
	</AppModal>
</template>
