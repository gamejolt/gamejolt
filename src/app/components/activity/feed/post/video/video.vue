<script lang="ts">
import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { $viewPostVideo } from '../../../../../../_common/fireside/post/video/video-model';
import AppVideoProcessingProgress from '../../../../../../_common/video/processing-progress/processing-progress.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';
import AppActivityFeedVideoPlayer from '../../_video-player/video-player.vue';

@Options({
	components: {
		AppActivityFeedVideoPlayer,
		AppVideoProcessingProgress,
	},
})
export default class AppActivityFeedPostVideo extends Vue {
	@Prop({ type: Object, required: true })
	item!: ActivityFeedItem;

	@Prop({ type: Object, required: true })
	post!: FiresidePost;

	@Inject({ from: ActivityFeedKey })
	feed!: ActivityFeedView;

	hasVideoProcessingError = false;
	videoProcessingErrorMsg = '';

	@Emit('query-param') emitQueryParam(_params: Record<string, string>) {}

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get video() {
		return this.post.videos[0];
	}

	onTimeChange(time: number) {
		this.emitQueryParam({ t: `${time}` });
	}

	onVideoPlay() {
		$viewPostVideo(this.video);
	}

	onVideoProcessingComplete(payload: any) {
		if (payload.video && this.video) {
			this.video.assign(payload.video);
		}
	}

	onVideoProcessingError(err: string | Error) {
		if (typeof err === 'string') {
			this.hasVideoProcessingError = true;
			this.videoProcessingErrorMsg = err;
		} else {
			// The only cases where an actual error is emitted is on network error during polling.
			// This does not necessarily mean an actual error during processing, so noop.
		}
	}
}
</script>

<template>
	<div class="-spacing">
		<template v-if="!hasVideoProcessingError">
			<template v-if="!video.is_processing && video.posterMediaItem">
				<AppActivityFeedVideoPlayer
					class="-video"
					:feed-item="item"
					:manifests="video.manifestSources"
					:media-item="video.posterMediaItem"
					@play="onVideoPlay"
					@time="onTimeChange"
				/>
			</template>
			<div v-else class="well sans-rounded fill-offset">
				<AppVideoProcessingProgress
					:post="post"
					@complete="onVideoProcessingComplete"
					@error="onVideoProcessingError"
				/>
			</div>
		</template>
		<template v-else>
			<div class="well">
				<div class="alert alert-notice">{{ videoProcessingErrorMsg }}</div>
			</div>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
@import '../../variables'

.-spacing
	margin-left: -($grid-gutter-width-xs / 2)
	margin-right: @margin-left
	margin-top: $-item-padding-xs-v

	@media $media-sm-up
		margin-left: -($grid-gutter-width / 2) + $border-width-base
		margin-right: @margin-left
		margin-top: $-item-padding-v
</style>
