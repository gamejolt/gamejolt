import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./banner.html?style=./banner.styl';

import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { BannerState, BannerStore, BannerMutation } from '../../../store/banner';

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
}
