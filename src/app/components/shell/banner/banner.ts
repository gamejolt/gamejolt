import View from '!view!./banner.html?style=./banner.styl';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { BannerModule, BannerStore } from '../../../store';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppShellBanner extends Vue {
	@BannerModule.State
	hasBanner!: BannerStore['hasBanner'];

	@BannerModule.State
	currentBanner!: BannerStore['currentBanner'];

	@BannerModule.Mutation
	clickBanner!: BannerStore['clickBanner'];

	@BannerModule.Mutation
	closeBanner!: BannerStore['closeBanner'];

	@Watch('hasBanner', { immediate: true })
	onHasBannerChange(isShowing: boolean) {
		if (isShowing) {
			Scroll.setOffsetTop(50 * 2);
		} else {
			Scroll.setOffsetTop(50);
		}
	}
}
