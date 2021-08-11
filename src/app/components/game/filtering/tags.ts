import { Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { TagsInfo } from '../../tag/tags-info.service';
import { GameFilteringContainer } from './container';

interface ArrayFilter {
	type: 'array';
	options: string[];
}

interface RadioFilter {
	type: 'radio';
	value: any;
	valueLabel: string;
}

type Filter = (ArrayFilter | RadioFilter) & {
	key: string;
	label: string;
};

@Options({})
export default class AppGameFilteringTags extends Vue {
	@Prop(Object)
	filtering!: GameFilteringContainer;

	readonly GameFilteringContainer = GameFilteringContainer;

	get tag() {
		const tag = this.$route.params.tag;
		if (!tag) {
			return undefined;
		}

		return TagsInfo.tags.find(i => i.id === tag);
	}

	get filters() {
		const filters: Filter[] = [];

		for (const [key, value] of Object.entries(this.filtering.filters)) {
			const type = GameFilteringContainer.definitions[key].type;
			const label = GameFilteringContainer.definitions[key].label;

			if (type === 'array') {
				filters.push({
					key,
					type,
					label,
					options: (value as string[]).map(
						i => GameFilteringContainer.definitions[key].options![i]
					),
				});
			} else if (type === 'radio') {
				filters.push({
					key,
					type,
					label,
					value,
					valueLabel: GameFilteringContainer.definitions[key].options![value],
				});
			}
		}

		return filters;
	}

	removeFilterOption(filter: string, option: any) {
		Analytics.trackEvent('game-filtering', 'remove', filter + '-' + option);

		this.filtering.unsetFilter(filter, option);
		this.filtering.onChanged();
	}

	clearTag() {
		this.$router.push({ name: 'discover.games.list._fetch' });
	}
}
