import { Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { GameFilteringContainer } from './container';

@Options({})
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
