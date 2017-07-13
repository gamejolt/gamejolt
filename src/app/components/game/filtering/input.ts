import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./input.html?style=./input.styl';

import { GameFilteringContainer } from './container';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppGameFilteringInput extends Vue {
	@Prop(Object) filtering: GameFilteringContainer;

	query = '';

	created() {
		this.query = this.filtering.filters.query;
	}

	clear() {
		this.query = '';
		this.filtering.unsetFilter('query');
		this.filtering.onChanged();

		Analytics.trackEvent('game-filtering', 'query-clear');
	}

	sendSearch() {
		this.filtering.setFilter('query', this.query);
		this.filtering.onChanged();

		if (this.query) {
			Analytics.trackEvent('game-filtering', 'query-change', this.query);
		} else {
			Analytics.trackEvent('game-filtering', 'query-change-empty');
		}
	}

	blur() {
		if (this.$refs.input) {
			(this.$refs.input as HTMLElement).blur();
		}
	}
}
