import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Ads } from '../ads.service';
import { Playwire } from './playwire.service';

@Component({})
export default class AppAdPlaywireVideo extends Vue {
	mounted() {
		Playwire.addAd(this);
	}

	beforeDestroy() {
		Playwire.removeAd(this);
	}

	display() {
		this.renderScript();

		// Log that we viewed this ad immediately.
		this.sendBeacon(Ads.EVENT_VIEW);
	}

	private sendBeacon(event: string) {
		Ads.sendBeacon(event, Ads.TYPE_DISPLAY);
	}

	private renderScript() {
		const script = window.document.createElement('script');
		script.dataset.config = 'https://config.playwire.com/1391/playlists/v2/4898/zeus.json';

		this.$el.appendChild(script);
		script.src = 'https://cdn.playwire.com/bolt/js/zeus/embed.js';
	}
}
