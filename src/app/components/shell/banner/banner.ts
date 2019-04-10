import { Scroll } from 'game-jolt-frontend-lib/components/scroll/scroll.service';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { BannerModule, BannerStore } from '../../../store';

@Component({
	components: {
		AppJolticon,
	},
})
export default class AppShellBanner extends Vue {
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
