import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { $viewFiresidePostVideo } from '../../../../../../_common/fireside/post/video/video-model';
import { AppImgResponsive } from '../../../../../../_common/img/responsive/responsive';
import AppMediaItemBackdrop from '../../../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../../../_common/media-item/media-item-model';
import { AppResponsiveDimensions } from '../../../../../../_common/responsive-dimensions/responsive-dimensions';
import AppVideoPlayer from '../../../../../../_common/video/player/player.vue';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';
import AppActivityFeedVideoEmbed from '../../_video-embed/video-embed.vue';

@Component({
	components: {
		AppResponsiveDimensions,
		AppMediaItemBackdrop,
		AppImgResponsive,
		AppVideoPlayer,
		AppActivityFeedVideoEmbed,
	},
})
export default class AppActivityFeedDevlogPostVideo extends Vue {
	@Prop(propRequired(ActivityFeedItem)) item!: ActivityFeedItem;
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;

	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	mediaItem = new MediaItem({
		id: 4300116,
		type: 'fireside-post-image',
		parent_id: 2120232,
		hash: 'zd9ds2jh',
		filename: 'arti_electroshock_1-zd9ds2jh.gif',
		filetype: 'image/gif',
		is_animated: true,
		width: 955,
		height: 536,
		filesize: 557429,
		crop_start_x: null,
		crop_start_y: null,
		crop_end_x: null,
		crop_end_y: null,
		avg_img_color: '403454',
		img_has_transparency: false,
		added_on: 1602487981000,
		status: 'active',
		img_url:
			'https://i.gjcdn.net/data/fireside/posts/33/232/2120232/media/arti_electroshock_1-zd9ds2jh.gif',
		mediaserver_url: 'https://m.gjcdn.net/fireside-post-image/900/4300116-ll-zd9ds2jh-v4.webp',
		mediaserver_url_webm:
			'https://i.gjcdn.net/data/fireside/posts/33/232/2120232/media/arti_electroshock_1-zd9ds2jh-8jhsk5ze.webm',
		mediaserver_url_mp4:
			'https://i.gjcdn.net/data/fireside/posts/33/232/2120232/media/arti_electroshock_1-zd9ds2jh-pptjsnpj.mp4',
	});

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get isFocused() {
		return this.feed.isItemFocused(this.item);
	}

	get video() {
		return this.post.videos[0];
	}

	onVideoPlay() {
		$viewFiresidePostVideo(this.video);
	}
}
