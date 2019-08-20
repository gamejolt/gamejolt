import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Screen } from '../../screen/screen-service';
import { Ads } from '../ads.service';
import AppAdPlaywire from '../playwire/playwire.vue';
import './widget-content.styl';

@Component({
	components: {
		AppAdPlaywire,
	},
})
export default class AppAdWidget extends Vue {
	@Prop({ type: String, default: 'rectangle' })
	size!: 'rectangle' | 'leaderboard' | 'footer';

	@Prop({ type: Boolean, default: false })
	staticSize!: boolean;

	get shouldShow() {
		// We never show "footer" ads on mobile sizes, since they are
		// leaderboards.
		if (this.size === 'footer' && Screen.isMobile) {
			return false;
		}

		return Ads.shouldShow;
	}
}
