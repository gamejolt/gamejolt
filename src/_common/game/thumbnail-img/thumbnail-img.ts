import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { ContentFocus } from '../../content-focus/content-focus.service';
import { AppImgResponsive } from '../../img/responsive/responsive';
import AppMediaItemBackdrop from '../../media-item/backdrop/backdrop.vue';
import { Screen } from '../../screen/screen-service';
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
	@Prop(Object) game!: Game;
	@Prop(Boolean) hideMedia?: boolean;
	@Prop(Boolean) animate?: boolean;

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

	imgLoadChange(isLoaded: boolean) {
		this.isThumbnailLoaded = isLoaded;
	}
}
