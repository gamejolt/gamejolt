<script lang="ts">
import { nextTick } from 'vue';
import { Emit, mixins, Options } from 'vue-property-decorator';
import {
	$saveCommunityCompetitionVoting,
	CommunityCompetitionModel,
	CompetitionPeriodVoting,
	VotingType,
	VotingUserRestriction,
} from '../../../../../../../_common/community/competition/competition.model';
import { formatDate } from '../../../../../../../_common/filters/date';
import AppFormLegend from '../../../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlDate from '../../../../../../../_common/form-vue/controls/AppFormControlDate.vue';
import AppFormControlToggle from '../../../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { FormTimezoneService } from '../../../../../../../_common/form-vue/form-timezone.service';
import { BaseForm } from '../../../../../../../_common/form-vue/form.service';
import AppLoading from '../../../../../../../_common/loading/AppLoading.vue';

type RadioOption<T> = {
	radioValue: T;
	text: string;
	helpText?: string;
};

class Wrapper extends BaseForm<CommunityCompetitionModel> {}

@Options({
	components: {
		AppFormLegend,
		AppFormControlDate,
		AppLoading,
		AppFormControlToggle,
	},
})
export default class FormCommunityCompetitionVotingEdit extends mixins(Wrapper) {
	modelClass = CommunityCompetitionModel;
	timezoneService: FormTimezoneService<CommunityCompetitionModel> | null = null;
	modelSaveHandler = $saveCommunityCompetitionVoting;

	readonly formatDate = formatDate;

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
			await nextTick();
			this.form.changed = false;
		}

		this.timezoneService = new FormTimezoneService(this.form);
		await this.timezoneService.load(true);
	}

	onClickCancel() {
		this.emitCancel();
	}
}
</script>

<template>
	<div>
		<div v-if="isInitial" class="alert alert-notice">
			<AppTranslate>
				You must fill out the form below and save it before voting will be enabled.
			</AppTranslate>
		</div>

		<AppForm :controller="form">
			<template v-if="timezoneService && timezoneService.loaded">
				<AppFormGroup name="voting_ends_on" :label="$gettext(`Voting End Date and Time`)">
					<p class="help-block">
						<span v-translate>
							Voting starts when the jam ends and continues until the date and time
							you choose below.
							<i>You can change this anytime before voting ends.</i>
						</span>
					</p>

					<AppFormControlDate
						:timezone-offset="timezoneService.activeTimezoneOffset"
						:min-date="formModel.ends_on"
					/>
					<AppFormControlErrors />
				</AppFormGroup>

				<template v-if="canEditDetails">
					<fieldset>
						<AppFormLegend>
							<AppTranslate>Community Voting</AppTranslate>
						</AppFormLegend>

						<p class="help-block">
							<AppTranslate>
								This allows members of the community to judge jam entries by rating
								them. You can specify who can vote and the type of voting below. At
								the end of the voting period, the ratings will be tallied and the
								entries will be ranked.
							</AppTranslate>
						</p>

						<AppFormGroup name="has_community_voting" hide-label>
							<AppFormControlToggle />
						</AppFormGroup>

						<template v-if="formModel.has_community_voting">
							<AppFormGroup
								name="voting_user_restriction"
								:label="$gettext(`Who can vote?`)"
							>
								<div
									v-for="option of votingUserRestrictionOptions"
									:key="option.radioValue"
									class="radio"
								>
									<label>
										<AppFormControlRadio
											type="radio"
											:value="option.radioValue"
										/>
										{{ option.text }}
										<span v-if="option.helpText" class="help-inline">
											- {{ option.helpText }}
										</span>
									</label>
								</div>
							</AppFormGroup>
							<AppFormGroup name="voting_type">
								<div
									v-for="option of votingTypeOptions"
									:key="option.radioValue"
									class="radio"
								>
									<label>
										<AppFormControlRadio
											type="radio"
											:value="option.radioValue"
										/>
										{{ option.text }}
										<span v-if="option.helpText" class="help-inline">
											- {{ option.helpText }}
										</span>
									</label>
								</div>
							</AppFormGroup>
						</template>
					</fieldset>

					<fieldset>
						<AppFormLegend>
							<AppTranslate>Awards</AppTranslate>
						</AppFormLegend>

						<p class="help-block">
							<AppTranslate>
								This lets you create awards and then choose entries to receive them.
								Awards can be added and assigned at any time, but we recommend
								assigning them during the voting period. After voting, award-winning
								entries will be displayed by default at the top of the Games page.
							</AppTranslate>
						</p>

						<AppFormGroup name="has_awards" hide-label>
							<AppFormControlToggle />
						</AppFormGroup>
					</fieldset>

					<div v-if="!isVotingValid" class="alert alert-notice">
						<AppTranslate>
							If you have voting on, you must enable either community voting or
							awards, or both.
						</AppTranslate>
					</div>
				</template>

				<AppFormButton :disabled="!isValid">
					<AppTranslate>Save</AppTranslate>
				</AppFormButton>
				<AppButton @click="onClickCancel">
					<AppTranslate>Cancel</AppTranslate>
				</AppButton>
			</template>

			<template v-else>
				<AppLoading centered />
			</template>
		</AppForm>
	</div>
</template>

<style lang="stylus" scoped></style>
