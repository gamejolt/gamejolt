import { Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { TagsInfo } from '../../tag/tags-info.service';
import { GameFilteringContainer } from './container';

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

	removeFilterOption(filter: string, option: any) {
		Analytics.trackEvent('game-filtering', 'remove', filter + '-' + option);

		this.filtering.unsetFilter(filter, option);
		this.filtering.onChanged();
	}

	clearTag() {
		this.$router.push({ name: 'discover.games.list._fetch' });
	}
}
