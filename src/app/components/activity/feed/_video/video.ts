import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./video.html?style=./video.styl';

import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppVideoEmbed } from '../../../../../lib/gj-lib-client/components/video/embed/embed';
import { AppResponsiveDimensions } from '../../../../../lib/gj-lib-client/components/responsive-dimensions/responsive-dimensions';

@View
@Component({
	components: {
		AppJolticon,
		AppVideoEmbed,
		AppResponsiveDimensions,
	},
})
export class AppActivityFeedVideo extends Vue {
	@Prop(String) videoId!: string;
	@Prop(String) thumbnail!: string;
	@Prop(Boolean) isHydrated?: boolean;

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
