import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./history.html?style=./history.styl';

import { SearchHistory } from './history-service';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppPopper } from '../../../../lib/gj-lib-client/components/popper/popper';

@View
@Component({
	components: {
		AppJolticon,
		AppPopper,
	},
	directives: {
		AppTrackEvent,
	},
})
export class AppSearchHistory extends Vue {
	isVisible = false;
	recentSearches: string[] = [];

	refresh() {
		this.recentSearches = SearchHistory.get();
	}

	onShow() {
		this.isVisible = true;
		this.refresh();
	}

	onHide() {
		this.isVisible = false;
	}

	go(query: string) {
		this.$router.push({
			name: 'search.results',
			query: { q: query },
		});
		Popover.hideAll();
	}

	clear() {
		SearchHistory.clear();
		Popover.hideAll();
	}
}
