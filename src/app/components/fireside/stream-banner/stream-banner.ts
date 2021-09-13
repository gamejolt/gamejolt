import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppLoading from '../../../../_common/loading/loading.vue';
import AppMediaItemBackdrop from '../../../../_common/media-item/backdrop/backdrop.vue';
import { AppObserveDimensions } from '../../../../_common/observe-dimensions/observe-dimensions.directive';
import { AppResponsiveDimensions } from '../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../_common/screen/screen-service';
import { AppFiresideContainer } from '../container/container';
import { createFiresideController, FiresideController } from '../controller/controller';
import AppFiresideStreamBannerVideo from './_video/video.vue';

const TEST_HASH = 'kkurmhzsijr';

@Component({
	components: {
		AppFiresideContainer,
		AppFiresideStreamBannerVideo,
		AppLoading,
		AppMediaItemBackdrop,
		AppResponsiveDimensions,
	},
	directives: {
		AppObserveDimensions,
	},
})
export default class AppFiresideStreamBanner extends Vue {
	controller: FiresideController | null = null;

	isFilled = false;

	readonly Screen = Screen;

	$refs!: {
		videoWrapper: HTMLDivElement;
	};

	get shouldShowStream() {
		if (GJ_IS_SSR || GJ_IS_CLIENT) {
			return false;
		}

		return (
			!!this.controller &&
			this.controller.isStreaming &&
			!!this.controller.rtc?.users.some(user => user.hasVideo)
		);
	}

	get focusedUser() {
		return this.controller?.rtc?.focusedUser;
	}

	get headerImgStyling() {
		if (!this.headerMediaItem) {
			return null;
		}

		return {
			'background-image': `url(${this.headerMediaItem.mediaserver_url})`,
		};
	}

	get headerMediaItem() {
		return this.controller?.fireside.header_media_item;
	}

	get location() {
		return this.controller?.fireside.location;
	}

	mounted() {
		Api.sendRequest(`/web/fireside/fetch/${TEST_HASH}`).then(payload => {
			this.createController(payload);
		});
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

	private createController(payload: any) {
		this.controller ??= createFiresideController(new Fireside(payload.fireside), true);
	}
}
