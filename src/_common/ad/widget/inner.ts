import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { FiresidePost } from '../../fireside/post/post-model';
import { Game } from '../../game/game.model';
import { User } from '../../user/user.model';
import { AdSlot } from '../ad-slot-info';
import { AdEventClick, AdEventView, AdTypeDisplay } from '../ad-store';

@Component({})
export default class AppAdWidgetInner extends Vue {
	@Prop(propRequired(AdSlot)) adSlot!: AdSlot;

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
		this.$ad.addAd(this);
	}

	beforeDestroy() {
		this.$ad.removeAd(this);
		this.$ad.removeClickTracker(this.$el);
	}

	display() {
		// This will completely regenerate the rendered ad component so that it
		// displays a new ad.
		this.adSlot.regenerateId();

		// Log that we viewed this ad immediately.
		this.sendBeacon(AdEventView);
		this.$ad.addClickTracker(this.$el, () => this.sendBeacon(AdEventClick));
	}

	private sendBeacon(event: string) {
		const { resource, resourceId } = this.resourceInfo;
		this.$ad.sendBeacon(event, AdTypeDisplay, resource, resourceId);
	}
}
