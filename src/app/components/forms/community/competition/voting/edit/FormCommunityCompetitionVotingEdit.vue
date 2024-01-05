<script lang="ts" setup>
import { computed, nextTick, ref, toRef, toRefs } from 'vue';
import AppButton from '../../../../../../../_common/button/AppButton.vue';
import {
	$saveCommunityCompetitionVoting,
	CommunityCompetitionModel,
	CompetitionPeriodVoting,
	VotingType,
	VotingUserRestriction,
} from '../../../../../../../_common/community/competition/competition.model';
import AppForm, {
	FormController,
	createForm,
	defineFormProps,
} from '../../../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '../../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormLegend from '../../../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlDate from '../../../../../../../_common/form-vue/controls/AppFormControlDate.vue';
import AppFormControlRadio from '../../../../../../../_common/form-vue/controls/AppFormControlRadio.vue';
import AppFormControlToggle from '../../../../../../../_common/form-vue/controls/AppFormControlToggle.vue';
import { FormTimezoneService } from '../../../../../../../_common/form-vue/form-timezone.service';
import AppLoading from '../../../../../../../_common/loading/AppLoading.vue';
import { $gettext } from '../../../../../../../_common/translate/translate.service';

type RadioOption<T> = {
	radioValue: T;
	text: string;
	helpText?: string;
};

const props = defineProps({
	...defineFormProps<CommunityCompetitionModel>(true),
});

const emit = defineEmits({
	cancel: () => true,
	submit: () => true,
});

const { model } = toRefs(props);

const timezoneService = ref<FormTimezoneService<CommunityCompetitionModel> | null>(null);

const isInitial = toRef(() => !model.value?.isVotingSetUp);

// TODO(component-setup-refactor-forms-1): Keeping as computed as toRef is giving type mismatch error
const votingUserRestrictionOptions = computed<RadioOption<VotingUserRestriction>[]>(() => {
	return [
		{
			radioValue: 'users',
			text: $gettext(`Users`),
			helpText: $gettext(`Anyone with a Game Jolt account can vote.`),
		},
		{
			radioValue: 'participants',
			text: $gettext(`Participants`),
			helpText: $gettext(`Only people who have submitted an entry can vote.`),
		},
	];
});

const votingTypeOptions = computed<RadioOption<VotingType>[]>(() => {
	return [
		{
			radioValue: 'overall',
			text: $gettext(`Overall`),
			helpText: $gettext(`Voters assign each entry a single rating.`),
		},
		{
			radioValue: 'categories',
			text: $gettext(`Categories`),
			helpText: $gettext(`Voters rate entries in multiple categories that you create.`),
		},
	];
});

const isVotingValid = toRef(() => form.formModel.has_community_voting || form.formModel.has_awards);
const isValid = toRef(() => (!form.valid ? false : isVotingValid.value));
const canEditDetails = toRef(() => model.value!.periodNum < CompetitionPeriodVoting);

const form: FormController<CommunityCompetitionModel> = createForm({
	model,
	modelClass: CommunityCompetitionModel,
	modelSaveHandler: $saveCommunityCompetitionVoting,
	async onInit() {
		if (isInitial.value) {
			// End date plus 1 day.
			form.formModel.voting_ends_on = form.formModel.ends_on + 1000 * 60 * 60 * 24;

			await nextTick();
			form.changed = false;
		}

		timezoneService.value = new FormTimezoneService(form);
		await timezoneService.value.load(true);
	},
	onSubmitSuccess() {
		emit('submit');
	},
});

function onClickCancel() {
	emit('cancel');
}
</script>

<template>
	<div>
		<div v-if="isInitial" class="alert alert-notice">
			{{
				$gettext(
					`You must fill out the form below and save it before voting will be enabled.`
				)
			}}
		</div>

		<AppForm :controller="form">
			<template v-if="timezoneService && timezoneService.loaded">
				<AppFormGroup name="voting_ends_on" :label="$gettext(`Voting End Date and Time`)">
					<p class="help-block">
						<span v-translate>
							{{
								$gettext(
									`Voting starts when the jam ends and continues until the date and time you choose below.`
								)
							}}
							{{ ' ' }}
							<i>{{ $gettext(`You can change this anytime before voting ends.`) }}</i>
						</span>
					</p>

					<AppFormControlDate
						:timezone-offset="timezoneService.activeTimezoneOffset"
						:min-date="form.formModel.ends_on"
					/>
					<AppFormControlErrors />
				</AppFormGroup>

				<template v-if="canEditDetails">
					<fieldset>
						<AppFormLegend>
							{{ $gettext(`Community Voting`) }}
						</AppFormLegend>

						<p class="help-block">
							{{
								$gettext(
									`This allows members of the community to judge jam entries by rating them. You can specify who can vote and the type of voting below. At the end of the voting period, the ratings will be tallied and the entries will be ranked.`
								)
							}}
						</p>

						<AppFormGroup name="has_community_voting" hide-label>
							<AppFormControlToggle />
						</AppFormGroup>

						<template v-if="form.formModel.has_community_voting">
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
										<AppFormControlRadio :value="option.radioValue" />
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
										<AppFormControlRadio :value="option.radioValue" />
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
							{{ $gettext(`Awards`) }}
						</AppFormLegend>

						<p class="help-block">
							{{
								$gettext(
									`This lets you create awards and then choose entries to receive them. Awards can be added and assigned at any time, but we recommend assigning them during the voting period. After voting, award-winning entries will be displayed by default at the top of the Games page.`
								)
							}}
						</p>

						<AppFormGroup name="has_awards" hide-label>
							<AppFormControlToggle />
						</AppFormGroup>
					</fieldset>

					<div v-if="!isVotingValid" class="alert alert-notice">
						{{
							$gettext(
								`If you have voting on, you must enable either community voting or awards, or both.`
							)
						}}
					</div>
				</template>

				<AppFormButton :disabled="!isValid">
					{{ $gettext(`Save`) }}
				</AppFormButton>
				<AppButton @click="onClickCancel">
					{{ $gettext(`Cancel`) }}
				</AppButton>
			</template>

			<template v-else>
				<AppLoading centered />
			</template>
		</AppForm>
	</div>
</template>
