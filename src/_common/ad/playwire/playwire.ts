import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import { FiresidePost } from '../../fireside/post/post-model';
import { Game } from '../../game/game.model';
import { User } from '../../user/user.model';
import { AdEventClick, AdEventView, AdTypeDisplay } from '../ad-store';

function generateSlotId() {
	return Math.random() + '';
}

@Component({})
export default class AppAdPlaywire extends Vue {
	@Prop(propOptional(String, 'rectangle'))
	size!: 'rectangle' | 'leaderboard' | 'footer';

	@Prop(propOptional(Boolean, false)) staticSize!: boolean;

	/**
	 * We populate this when we first decide to show the ad, and then we change
	 * it as the route changes, which will tell Playwire to load a new ad in.
	 */
	slotId: string | null = null;

	/**
	 * This is a Playwire placement key and must match their system.
	 */
	get placement() {
		if (this.size === 'rectangle') {
			// We got Playwire to make it so that "btf" ads will never change size.
			// We can use this when there is content below it that we never want
			// being pushed around, such as feeds.
			const position = this.staticSize ? 'btf' : 'atf';
			return `med_rect_${position}`;
		}

		// Footer is a special case ad that should show below all content, right
		// above the footer.
		if (this.size === 'footer') {
			return 'leaderboard_btf';
		}

		return 'leaderboard_atf';
	}

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
		this.$ad.removeClickTracker(this.$el);
	}

	display() {
		this.slotId = generateSlotId();

		// Log that we viewed this ad immediately.
		this.sendBeacon(AdEventView);
		this.$ad.addClickTracker(this.$el, () => this.sendBeacon(AdEventClick));
	}

	private sendBeacon(event: string) {
		const { resource, resourceId } = this.resourceInfo;
		this.$ad.sendBeacon(event, AdTypeDisplay, resource, resourceId);
	}
}
