import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { ContentFocus } from '../../content-focus/content-focus.service';
import { AppImgResponsive } from '../../img/responsive/responsive';
import AppMediaItemBackdrop from '../../media-item/backdrop/backdrop.vue';
import { Screen } from '../../screen/screen-service';
import { getVideoPlayerFromSources } from '../../video/player/controller';
import AppVideo from '../../video/video.vue';
import { Game } from '../game.model';

@Component({
	components: {
		AppImgResponsive,
		AppMediaItemBackdrop,
		AppVideo,
	},
})
export default class AppGameThumbnailImg extends Vue {
	@Prop(propRequired(Object)) game!: Game;
	@Prop(propOptional(Boolean, false)) hideMedia!: boolean;
	@Prop(propOptional(Boolean, false)) animate!: boolean;

	isThumbnailLoaded = GJ_IS_SSR;

	get mediaItem() {
		return this.game.thumbnail_media_item;
	}

	get hasVideo() {
		return (
			this.mediaItem &&
			this.mediaItem.is_animated &&
			Screen.isDesktop &&
			!GJ_IS_SSR &&
			this.animate
		);
	}

	get shouldPlayVideo() {
		return this.hasVideo && ContentFocus.hasFocus;
	}

	get videoController() {
		if (!this.mediaItem) {
			return;
		}

		const sourcesPayload = {
			mp4: this.mediaItem.mediaserver_url_mp4,
			webm: this.mediaItem.mediaserver_url_webm,
		};
		return getVideoPlayerFromSources(sourcesPayload, 'gif', this.mediaItem.mediaserver_url);
	}

	imgLoadChange(isLoaded: boolean) {
		this.isThumbnailLoaded = isLoaded;
	}
}
