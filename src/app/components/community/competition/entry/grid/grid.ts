import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../../../../utils/vue';
import {
	CommunityCompetition,
	CompetitionPeriodVoting,
} from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { AppCondenseWhitespace } from '../../../../../../_common/condense-whitespace';
import { formatNumber } from '../../../../../../_common/filters/number';
import AppCommunityCompetitionEntryThumbnail from '../thumbnail/thumbnail.vue';

@Options({
	components: {
		AppCommunityCompetitionEntryThumbnail,
		AppCondenseWhitespace,
	},
})
export default class AppCommunityCompetitionEntryGrid extends Vue {
	@Prop({ type: Object, required: true }) competition!: CommunityCompetition;
	@Prop({ type: Array, required: true }) entries!: CommunityCompetitionEntry[];
	@Prop(propOptional(Number, 0)) currentPage!: number;
	@Prop(propOptional(Number, 0)) pageCount!: number;
	@Prop(propOptional(Number, 6)) numPlaceholders!: number;
	@Prop(propOptional(Object))
	category?: CommunityCompetitionVotingCategory;
	@Prop(propOptional(Boolean, false)) showRemove!: boolean;

	readonly formatNumber = formatNumber;

	get placeholderCount() {
		const iterators = [];
		for (let i = 0; i < this.numPlaceholders; i++) {
			iterators.push(i);
		}
		return iterators;
	}

	get shouldShowThumbnailRanks() {
		return (
			this.competition.is_voting_enabled &&
			this.competition.has_community_voting &&
			this.competition.are_results_calculated
		);
	}

	get shouldShowThumbnailAwards() {
		return (
			this.competition.is_voting_enabled &&
			this.competition.has_awards &&
			this.competition.periodNum >= CompetitionPeriodVoting
		);
	}

	@Emit('remove')
	emitRemove(_entry: CommunityCompetitionEntry) {}
}
