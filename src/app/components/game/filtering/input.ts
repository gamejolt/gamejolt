import { Analytics } from 'game-jolt-frontend-lib/components/analytics/analytics.service';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { GameFilteringContainer } from './container';


@Component({
	components: {
		AppJolticon,
	},
})
export default class AppGameFilteringInput extends Vue {
	@Prop(Object) filtering!: GameFilteringContainer;

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
