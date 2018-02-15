import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import View from '!view!./banner.html?style=./banner.styl';

import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { BannerState, BannerStore, BannerMutation } from '../../../store/banner';
import { Scroll } from '../../../../lib/gj-lib-client/components/scroll/scroll.service';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppShellBanner extends Vue {
	@BannerState shouldShowBanner: BannerStore['shouldShowBanner'];
	@BannerState currentBanner: BannerStore['currentBanner'];
	@BannerMutation clickBanner: BannerStore['clickBanner'];
	@BannerMutation closeBanner: BannerStore['closeBanner'];

	@Watch('shouldShowBanner', { immediate: true })
	onShouldShowBannerChange(isShowing: boolean) {
		if (isShowing) {
			Scroll.setOffsetTop(50 * 2);
		} else {
			Scroll.setOffsetTop(50);
		}
	}
}
