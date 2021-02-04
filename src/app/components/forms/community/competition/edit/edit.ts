import Component from 'vue-class-component';
import {
	CommunityCompetition,
	CompetitionPeriodVoting,
} from '../../../../../../_common/community/competition/competition.model';
import { date } from '../../../../../../_common/filters/date';
import AppFormControlDate from '../../../../../../_common/form-vue/control/date/date.vue';
import { FormTimezoneService } from '../../../../../../_common/form-vue/control/date/form-timezone.service';
import { BaseForm, FormOnInit } from '../../../../../../_common/form-vue/form.service';
import AppFormLegend from '../../../../../../_common/form-vue/legend/legend.vue';
import AppLoading from '../../../../../../_common/loading/loading.vue';
import AppCommunityCompetitionDate from '../../../../community/competition/date/date.vue';

@Component({
	components: {
		AppFormLegend,
		AppFormControlDate,
		AppLoading,
		AppCommunityCompetitionDate,
	},
	filters: {
		date,
	},
})
export default class FormCommunityCompetitionEdit extends BaseForm<CommunityCompetition>
	implements FormOnInit {
	modelClass = CommunityCompetition;
	timezoneService: FormTimezoneService<CommunityCompetition> | null = null;

	get endsOnControlRules() {
		const rules = {
			min_date: this.formModel.starts_on,
		} as any;
		if (this.formModel.is_voting_enabled) {
			rules['max_date'] = this.formModel.voting_ends_on;
		}

		return rules;
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
