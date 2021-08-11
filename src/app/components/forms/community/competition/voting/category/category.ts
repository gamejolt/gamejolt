import { Options, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../../utils/vue';
import { CommunityCompetition } from '../../../../../../../_common/community/competition/competition.model';
import { CommunityCompetitionVotingCategory } from '../../../../../../../_common/community/competition/voting-category/voting-category.model';
import AppFormControlTextarea from '../../../../../../../_common/form-vue/control/textarea/textarea.vue';
import { BaseForm, FormOnBeforeSubmit } from '../../../../../../../_common/form-vue/form.service';

@Options({
	components: {
		AppFormControlTextarea,
	},
})
export default class FormCommunityCompetitionVotingCategory
	extends BaseForm<CommunityCompetitionVotingCategory>
	implements FormOnBeforeSubmit
{
	@Prop(propRequired(CommunityCompetition)) competition!: CommunityCompetition;

	modelClass = CommunityCompetitionVotingCategory;

	get isAdding() {
		return !this.model;
	}

	get nameAvailabilityUrl() {
		let endpoint =
			'/web/dash/communities/competitions/voting-categories/check-field-availability/' +
			this.competition.id;

		if (this.model?.id) {
			endpoint += '/' + this.model.id;
		}

		return endpoint;
	}

	onBeforeSubmit() {
		// When creating a new category, this field isn't set yet.
		if (!this.formModel.community_competition_id) {
			this.setField('community_competition_id', this.competition.id);
		}
	}
}
