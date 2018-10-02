import View from '!view!./history.html?style=./history.styl';
import { Popper } from 'game-jolt-frontend-lib/components/popper/popper.service';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppPopper } from '../../../../lib/gj-lib-client/components/popper/popper';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { SearchHistory } from './history-service';

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
		Popper.hideAll();
	}

	clear() {
		SearchHistory.clear();
		Popper.hideAll();
	}
}
