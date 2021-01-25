import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { CommunityCompetitionAward } from '../../../../../../_common/community/competition/award/award.model';
import { CommunityCompetition } from '../../../../../../_common/community/competition/competition.model';
import AppFormControlTextarea from '../../../../../../_common/form-vue/control/textarea/textarea.vue';
import { BaseForm, FormOnBeforeSubmit } from '../../../../../../_common/form-vue/form.service';

@Component({
	components: {
		AppFormControlTextarea,
	},
})
export default class FormCommunityCompetitionAward extends BaseForm<CommunityCompetitionAward>
	implements FormOnBeforeSubmit {
	@Prop(propRequired(CommunityCompetition)) competition!: CommunityCompetition;

	modelClass = CommunityCompetitionAward;

	get isAdding() {
		return !this.model;
	}

	get nameAvailabilityUrl() {
		let endpoint =
			'/web/dash/communities/competitions/awards/check-field-availability/' +
			this.competition.id;

		if (this.model?.id) {
			endpoint += '/' + this.model.id;
		}

		return endpoint;
	}

	onBeforeSubmit() {
		// When creating a new award, this field isn't set yet.
		if (!this.formModel.community_competition_id) {
			this.setField('community_competition_id', this.competition.id);
		}
	}
}
