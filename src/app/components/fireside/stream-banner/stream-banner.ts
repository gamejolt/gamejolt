import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import AppLoading from '../../../../_common/loading/loading.vue';
import { AppObserveDimensions } from '../../../../_common/observe-dimensions/observe-dimensions.directive';

@Component({
	components: {
		AppFiresideStreamBannerVideo: () => import('./_video/video.vue'),
		AppLoading,
	},
	directives: {
		AppObserveDimensions,
	},
})
export default class AppFiresideStreamBanner extends Vue {
	@Prop({ type: Fireside, required: true })
	fireside!: Fireside;

	isFilled = false;

	$refs!: {
		videoWrapper: HTMLDivElement;
	};

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
