import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./widget.html?style=./widget.styl';

import { GameFilteringContainer } from './container';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		AppPopover,
		AppJolticon,
	},
	directives: {
		AppPopoverTrigger,
		AppTrackEvent,
	},
	filters: {
		number,
	},
})
export class AppGameFilteringWidget extends Vue {
	@Prop(Object) filtering: GameFilteringContainer;

	@State app: Store['app'];

	GameFilteringContainer = GameFilteringContainer;

	hovered: any = {};

	orderedFilters: any = {
		price: ['free', 'sale', 'paid', '5-less', '15-less', '30-less'],
		os: ['windows', 'mac', 'linux', 'other', 'rom'],
		browser: ['html', 'flash', 'unity', 'applet', 'silverlight'],
		maturity: ['everyone', 'teen', 'adult'],
		status: ['complete', 'wip'],
		partners: ['partners'],
	};

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
