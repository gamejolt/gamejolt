import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { CommunityCompetition } from '../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
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

	readonly number = number;
}
