import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Ads } from '../../../components/ad/ads.service';
import AppAdPlaywire from '../playwire/playwire.vue';
import './widget-content.styl';

@Component({
	components: {
		AppAdPlaywire,
	},
})
export default class AppAdWidget extends Vue {
	@Prop({ type: String, default: 'rectangle' })
	size!: 'rectangle' | 'leaderboard';

	@Prop({ type: Boolean, default: false })
	staticSize!: boolean;

	get shouldShow() {
		return Ads.shouldShow;
	}
}
