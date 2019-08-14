import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Ads } from '../../../components/ad/ads.service';
import { Playwire } from '../../../components/ad/playwire/playwire.service';
import { FiresidePost } from '../../../components/fireside/post/post-model';
import { Game } from '../../../components/game/game.model';
import { User } from '../../../components/user/user.model';

function generateSlotId() {
	return Math.random() + '';
}

let clickTrackerBootstrapped = false;
let focusedElem: Element | null = null;
const clickTrackers: Map<Element, Function> = new Map();

function addClickTracker(elem: Element, cb: Function) {
	clickTrackers.set(elem, cb);
	initClickTracking();
}

function removeClickTracker(elem: Element) {
	clickTrackers.delete(elem);
}

function initClickTracking() {
	if (clickTrackerBootstrapped || !Ads.shouldShow) {
		return;
	}

	clickTrackerBootstrapped = true;

	// Checking the active element in an interval seems to be the only way of tracking clicks.
	setInterval(function() {
		if (document.activeElement === focusedElem) {
			return;
		}

		focusedElem = document.activeElement;
		clickTrackers.forEach((cb, adElem) => {
			if (focusedElem && adElem.contains(focusedElem)) {
				cb();
			}
		});
	}, 1000);
}

@Component({})
export default class AppAdPlaywire extends Vue {
	@Prop({ type: String, default: 'rectangle' })
	size!: 'rectangle' | 'leaderboard';

	@Prop({ type: Boolean, default: false })
	staticSize!: boolean;

	/**
	 * We populate this when we first decide to show the ad, and then we change
	 * it as the route changes, which will tell Playwire to load a new ad in.
	 */
	slotId: string | null = null;

	/**
	 * This is a Playwire placement key ad must match their system.
	 */
	get placement() {
		const size = this.size === 'rectangle' ? 'med_rect' : 'leaderboard';
		// We got Playwire to make it so that "btf" ads will never change size.
		// We can use this when their is content below it that we never want
		// being pushed around, such as feeds.
		const position = this.staticSize ? 'btf' : 'atf';
		return `${size}_${position}`;
	}

	get resourceInfo() {
		let resource: string = undefined as any;
		let resourceId: number = undefined as any;

		const adResource = Ads.settings.resource;
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
		Playwire.addAd(this);
	}

	beforeDestroy() {
		Playwire.removeAd(this);
		removeClickTracker(this.$el);
	}

	display() {
		this.slotId = generateSlotId();

		// Log that we viewed this ad immediately.
		this.sendBeacon(Ads.EVENT_VIEW);
		addClickTracker(this.$el, () => this.sendBeacon(Ads.EVENT_CLICK));
	}

	private sendBeacon(event: string) {
		Ads.sendBeacon(
			event,
			Ads.TYPE_DISPLAY,
			this.resourceInfo.resource,
			this.resourceInfo.resourceId
		);
	}
}
