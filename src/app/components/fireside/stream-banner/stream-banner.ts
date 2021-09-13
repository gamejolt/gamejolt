import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppLoading from '../../../../_common/loading/loading.vue';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { AppObserveDimensions } from '../../../../_common/observe-dimensions/observe-dimensions.directive';
import { Screen } from '../../../../_common/screen/screen-service';
import AppFiresideStreamBannerVideo from './_video/video.vue';

@Component({
	components: {
		AppFiresideContainer: async () =>
			(await import('../container/container')).AppFiresideContainer,
		AppFiresideStreamBannerVideo,
		AppLoading,
		AppMediaItemBackdrop,
	},
	directives: {
		AppObserveDimensions,
	},
})
export default class AppFiresideStreamBanner extends Vue {
	@Prop({ type: Fireside, required: true })
	fireside!: Fireside;

	isFilled = false;

	readonly Screen = Screen;

	$refs!: {
		videoWrapper: HTMLDivElement;
	};

	get headerImgStyling() {
		if (!this.headerMediaItem) {
			return null;
		}

		return {
			'background-image': `url(${this.headerMediaItem.mediaserver_url})`,
		};
	}

	get headerMediaItem() {
		return this.fireside.header_media_item;
	}

	get location() {
		return this.fireside.location;
	}

	onDimensionsChange() {
		const container = this.$el;
		const video = this.$refs.videoWrapper;
		if (!container || !video) {
			this.isFilled = false;
			return;
		}

		this.isFilled = Math.floor(container.clientWidth) <= Math.ceil(video.clientWidth);
	}
}
