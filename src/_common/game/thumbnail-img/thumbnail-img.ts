import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppJolticon from '../../jolticon/jolticon.vue';
import { ContentFocus } from '../../content-focus/content-focus.service';
import { AppImgResponsive } from '../../img/responsive/responsive';
import { Screen } from '../../screen/screen-service';
import AppVideo from '../../video/video.vue';
import { Game } from '../game.model';

@Component({
	components: {
		AppJolticon,
		AppImgResponsive,
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
			this.mediaItem && this.mediaItem.is_animated && Screen.isDesktop && !GJ_IS_SSR && this.animate
		);
	}

	get shouldPlayVideo() {
		// When the window is not focused, or when we're scrolling, we don't want to play videos.
		// This should speed up inactive tabs.
		return this.hasVideo && ContentFocus.hasFocus && !Screen.isScrolling;
	}

	imgLoadChange(isLoaded: boolean) {
		this.isThumbnailLoaded = isLoaded;
	}
}
