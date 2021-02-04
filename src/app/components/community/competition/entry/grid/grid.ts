import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../../utils/vue';
import {
	CommunityCompetition,
	CompetitionPeriodVoting,
} from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../_common/community/competition/voting-category/voting-category.model';
import { AppCondenseWhitespace } from '../../../../../../_common/condense-whitespace';
import { number } from '../../../../../../_common/filters/number';
import AppCommunityCompetitionEntryThumbnail from '../thumbnail/thumbnail.vue';

@Component({
	components: {
		AppCommunityCompetitionEntryThumbnail,
		AppCondenseWhitespace,
	},
})
export default class AppCommunityCompetitionEntryGrid extends Vue {
	@Prop(propRequired(CommunityCompetition)) competition!: CommunityCompetition;
	@Prop(propRequired(Array)) entries!: CommunityCompetitionEntry[];
	@Prop(propRequired(Number)) currentPage!: number;
	@Prop(propRequired(Number)) pageCount!: number;
	@Prop(propOptional(CommunityCompetitionVotingCategory))
	category?: CommunityCompetitionVotingCategory;

	get placeholderCount() {
		const max = Math.min(this.competition.entry_count, 6);
		const iterators = [];
		for (let i = 0; i < max; i++) {
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

	readonly number = number;
}
