import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Ads } from '../ads.service';
import { Playwire } from './playwire.service';

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
	size!: 'rectangle' | 'leaderboard' | 'footer';

	@Prop({ type: Boolean, default: false })
	staticSize!: boolean;

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
		Ads.sendBeacon(event, Ads.TYPE_DISPLAY);
	}
}
