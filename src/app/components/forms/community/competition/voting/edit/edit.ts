import Component from 'vue-class-component';
import { Emit } from 'vue-property-decorator';
import {
	CommunityCompetition,
	CompetitionPeriodVoting,
	VotingType,
	VotingUserRestriction,
} from '../../../../../../../_common/community/competition/competition.model';
import { date } from '../../../../../../../_common/filters/date';
import AppFormControlDate from '../../../../../../../_common/form-vue/control/date/date.vue';
import { FormTimezoneService } from '../../../../../../../_common/form-vue/control/date/form-timezone.service';
import AppFormControlToggle from '../../../../../../../_common/form-vue/control/toggle/toggle.vue';
import { BaseForm, FormOnInit } from '../../../../../../../_common/form-vue/form.service';
import AppFormLegend from '../../../../../../../_common/form-vue/legend/legend.vue';
import AppLoading from '../../../../../../../_common/loading/loading.vue';

type RadioOption<T> = {
	radioValue: T;
	text: string;
	helpText?: string;
};

@Component({
	components: {
		AppFormLegend,
		AppFormControlDate,
		AppLoading,
		AppFormControlToggle,
	},
	filters: {
		date,
	},
})
export default class FormCommunityCompetitionVotingEdit extends BaseForm<CommunityCompetition>
	implements FormOnInit {
	modelClass = CommunityCompetition;
	timezoneService: FormTimezoneService<CommunityCompetition> | null = null;
	saveMethod: '$saveVoting' = '$saveVoting';

	@Emit('cancel')
	emitCancel() {}

	get isInitial() {
		return !this.model?.isVotingSetUp;
	}

	get votingUserRestrictionOptions(): RadioOption<VotingUserRestriction>[] {
		return [
			{
				radioValue: 'users',
				text: this.$gettext(`Users`),
				helpText: this.$gettext(`Anyone with a Game Jolt account can vote.`),
			},
			{
				radioValue: 'participants',
				text: this.$gettext(`Participants`),
				helpText: this.$gettext(`Only people who have submitted an entry can vote.`),
			},
		];
	}

	get votingTypeOptions(): RadioOption<VotingType>[] {
		return [
			{
				radioValue: 'overall',
				text: this.$gettext(`Overall`),
				helpText: this.$gettext(`Voters assign each entry a single rating.`),
			},
			{
				radioValue: 'categories',
				text: this.$gettext(`Categories`),
				helpText: this.$gettext(
					`Voters rate entries in multiple categories that you create.`
				),
			},
		];
	}

	get isVotingValid() {
		return this.formModel.has_community_voting || this.formModel.has_awards;
	}

	get isValid() {
		if (!this.valid) {
			return false;
		}

		return this.isVotingValid;
	}

	get canEditDetails() {
		return this.model!.periodNum < CompetitionPeriodVoting;
	}

	async onInit() {
		if (this.isInitial) {
			// End date plus 1 day.
			this.setField('voting_ends_on', this.formModel.ends_on + 1000 * 60 * 60 * 24);
			await this.$nextTick();
			this.changed = false;
		}

		this.timezoneService = new FormTimezoneService(this);
		await this.timezoneService.load(true);
	}

	onClickCancel() {
		this.emitCancel();
	}
}
