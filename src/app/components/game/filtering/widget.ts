import { Analytics } from 'game-jolt-frontend-lib/components/analytics/analytics.service';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive';
import AppPopper from 'game-jolt-frontend-lib/components/popper/popper.vue';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';
import { GameFilteringContainer } from './container';

@Component({
	components: {
		AppPopper,
		AppJolticon,
	},
	directives: {
		AppTrackEvent,
	},
	filters: {
		number,
	},
})
export default class AppGameFilteringWidget extends Vue {
	@Prop(Object)
	filtering!: GameFilteringContainer;

	@State
	app!: Store['app'];

	hovered: any = {};

	get filters() {
		return ['price', 'os', 'browser', 'maturity', 'status', 'partners'];
	}

	get definitions() {
		return GameFilteringContainer.definitions;
	}

	onMouseover(filter: string, option: any) {
		this.$set(this.hovered, filter, option);
	}

	onMouseout(filter: string) {
		this.$set(this.hovered, filter, null);
	}

	toggleFilterOption(filter: string, option: any) {
		const label = filter + '-' + option;
		if (this.filtering.isFilterOptionSet(filter, option)) {
			Analytics.trackEvent('game-filtering', 'toggle', label + '-off');
		} else {
			Analytics.trackEvent('game-filtering', 'toggle', label + '-on');
		}

		this.filtering.toggleFilterOption(filter, option);
		this.filtering.onChanged();
	}

	getJolticon(filter: string, option: any) {
		if (filter === 'os') {
			return option === 'other' ? 'other-os' : option;
		} else if (filter === 'browser') {
			if (option === 'html') {
				return 'html5';
			} else if (option === 'applet') {
				return 'java';
			} else {
				return option;
			}
		}
	}
}
