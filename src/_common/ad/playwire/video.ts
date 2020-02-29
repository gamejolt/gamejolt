import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { FiresidePost } from '../../fireside/post/post-model';
import { Game } from '../../game/game.model';
import { User } from '../../user/user.model';
import { AdEventView, AdTypeDisplay } from '../ad-store';

@Component({})
export default class AppAdPlaywireVideo extends Vue {
	get resourceInfo() {
		let resource: string = undefined as any;
		let resourceId: number = undefined as any;

		const adResource = this.$ad.settings.resource;
		if (adResource instanceof Game) {
			resource = 'Game';
			resourceId = adResource.id;
		} else if (adResource instanceof User) {
			resource = 'User';
			resourceId = adResource.id;
		} else if (adResource instanceof FiresidePost) {
			resource = 'Fireside_Post';
			resourceId = adResource.id;
		}

		return { resource, resourceId };
	}

	mounted() {
		this.$playwire.addAd(this);
	}

	beforeDestroy() {
		this.$playwire.removeAd(this);
	}

	display() {
		this.renderScript();

		// Log that we viewed this ad immediately.
		this.sendBeacon(AdEventView);
	}

	private sendBeacon(event: string) {
		const { resource, resourceId } = this.resourceInfo;
		this.$ad.sendBeacon(event, AdTypeDisplay, resource, resourceId);
	}

	private renderScript() {
		const script = window.document.createElement('script');
		script.dataset.config = 'https://config.playwire.com/1391/playlists/v2/4898/zeus.json';

		this.$el.appendChild(script);
		script.src = 'https://cdn.playwire.com/bolt/js/zeus/embed.js';
	}
}
