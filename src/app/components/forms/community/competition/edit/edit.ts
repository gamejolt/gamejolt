import { Options } from 'vue-property-decorator';
import {
	CommunityCompetition,
	CompetitionPeriodVoting,
} from '../../../../../../_common/community/competition/competition.model';
import { formatDate } from '../../../../../../_common/filters/date';
import AppFormLegend from '../../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlDate from '../../../../../../_common/form-vue/controls/AppFormControlDate.vue';
import { FormTimezoneService } from '../../../../../../_common/form-vue/form-timezone.service';
import { BaseForm } from '../../../../../../_common/form-vue/form.service';
import { validateMaxDate, validateMinDate } from '../../../../../../_common/form-vue/validators';
import AppLoading from '../../../../../../_common/loading/loading.vue';
import AppCommunityCompetitionDate from '../../../../community/competition/date/date.vue';

@Options({
	components: {
		AppFormLegend,
		AppFormControlDate,
		AppLoading,
		AppCommunityCompetitionDate,
	},
})
export default class FormCommunityCompetitionEdit extends BaseForm<CommunityCompetition> {
	modelClass = CommunityCompetition;
	timezoneService: FormTimezoneService<CommunityCompetition> | null = null;

	readonly formatDate = formatDate;

	get endsOnControlValidators() {
		const validators = [validateMinDate(this.formModel.starts_on)];
		if (this.formModel.is_voting_enabled) {
			validators.push(validateMaxDate(this.formModel.voting_ends_on));
		}

		return validators;
	}

	get shouldShowSaveButton() {
		// Before and during the competition, start/end dates can be edited.
		return this.model!.periodNum < CompetitionPeriodVoting;
	}

	async onInit() {
		this.timezoneService = new FormTimezoneService(this);
		await this.timezoneService.load(true);
	}
}
