import { AppResponsiveDimensions } from '../../../../../_common/responsive-dimensions/responsive-dimensions';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';
import AppJolticon from '../../../../../_common/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
import { ActivityFeedView } from '../view';

@Component({
	components: {
		AppJolticon,
		AppVideoEmbed,
		AppResponsiveDimensions,
	},
})
export default class AppActivityFeedVideo extends Vue {
	@Inject()
	feed!: ActivityFeedView;

	@Prop(String)
	videoId!: string;

	@Prop(String)
	thumbnail!: string;

	@Prop(Boolean)
	isHydrated?: boolean;

	contentBootstrapped = false;
	isShowingVideo = GJ_IS_SSR;
	shouldAutoplay = !GJ_IS_SSR;

	async onDimensionsChange() {
		if (!this.contentBootstrapped) {
			this.contentBootstrapped = true;

			await this.$nextTick();
			this.$emit('bootstrap');
		}
	}

	play() {
		this.isShowingVideo = true;
		this.$emit('play');
	}
}
