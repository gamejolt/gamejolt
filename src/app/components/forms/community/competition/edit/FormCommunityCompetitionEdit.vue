<script lang="ts" setup>
import { computed, ref, toRef } from 'vue';

import {
	$saveCommunityCompetition,
	CommunityCompetitionModel,
	CompetitionPeriodVoting,
} from '../../../../../../_common/community/competition/competition.model';
import AppForm, {
	createForm,
	FormController,
} from '../../../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../../../_common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '../../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormLegend from '../../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlDate from '../../../../../../_common/form-vue/controls/AppFormControlDate.vue';
import AppFormControlSelect from '../../../../../../_common/form-vue/controls/AppFormControlSelect.vue';
import { FormTimezoneService } from '../../../../../../_common/form-vue/form-timezone.service';
import AppLoading from '../../../../../../_common/loading/AppLoading.vue';
import AppTranslate from '../../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import AppCommunityCompetitionDate from '../../../../community/competition/date/AppCommunityCompetitionDate.vue';

type FormModel = CommunityCompetitionModel;

const props = defineProps({
	model: {
		type: Object as () => CommunityCompetitionModel,
		default: undefined,
	},
});

const timezoneService = ref<FormTimezoneService<CommunityCompetitionModel> | null>(null);

const shouldShowSaveButton = computed(() => props.model!.periodNum < CompetitionPeriodVoting);

const form: FormController<FormModel> = createForm<FormModel>({
	modelClass: CommunityCompetitionModel,
	modelSaveHandler: $saveCommunityCompetition,
	model: toRef(props, 'model'),
	async onInit() {
		timezoneService.value = new FormTimezoneService(form);
		await timezoneService.value.load(true);
	},
});
</script>

<template>
	<AppForm :controller="form">
		<fieldset>
			<AppFormLegend>
				<AppTranslate>Date and Time</AppTranslate>
			</AppFormLegend>

			<template v-if="model && timezoneService && timezoneService.loaded">
				<template v-if="!model.hasStarted">
					<AppFormGroup name="timezone" :label="$gettext(`Select a Timezone`)">
						<p class="help-block">
							<AppTranslate>
								All time selection below will use this timezone. You can't
								change this once the jam starts, so make sure you've set it
								correctly.
							</AppTranslate>
						</p>

						<p class="help-block">
							<strong>
								<AppTranslate>
									Should auto-detect, but if it doesn't, choose your closest city.
								</AppTranslate>
							</strong>
						</p>

						<AppFormControlSelect>
							<optgroup
								v-for="(timezones, region) of timezoneService.timezones"
								:key="region"
								:label="String(region)"
							>
								<option
									v-for="timezone of timezones"
									:key="timezone.i"
									:value="timezone.i"
								>
									{{ timezone.label }}
								</option>
							</optgroup>
						</AppFormControlSelect>

						<AppFormControlErrors />
					</AppFormGroup>
				</template>
				<template v-else>
					<AppFormGroup name="timezone" :label="$gettext(`Selected Timezone`)">
						<p class="help-block">
							<AppTranslate>
								All time selection below are using this timezone.
							</AppTranslate>
						</p>
						{{ timezoneService.activeTimezoneName }}
					</AppFormGroup>
				</template>

				<AppFormGroup name="starts_on" :label="$gettext(`Start Date and Time`)">
					<template v-if="!model.hasStarted">
						<p class="help-block">
							<AppTranslate>
								Your jam begins on this date and time. You can change this
								anytime before the jam starts.
							</AppTranslate>
						</p>

						<AppFormControlDate
							:timezone-offset="timezoneService.activeTimezoneOffset"
							:min-date="timezoneService.now"
							:max-date="form.formModel.ends_on"
						/>
						<AppFormControlErrors />
					</template>

					<template v-else>
						<AppCommunityCompetitionDate
							:date="model.starts_on"
							:timezone="model.timezone"
						/>

						<p class="help-block">
							<AppTranslate>Your jam began on this date and time.</AppTranslate>
						</p>
					</template>
				</AppFormGroup>

				<AppFormGroup name="ends_on" :label="$gettext(`End Date and Time`)">
					<template v-if="!model.hasEnded">
						<p class="help-block">
							<AppTranslate>
								Your jam ends on this date and time. You can change this
								anytime before the jam ends.
							</AppTranslate>
						</p>

						<AppFormControlDate
							:timezone-offset="timezoneService.activeTimezoneOffset"
							:min-date="form.formModel.starts_on"
							:max-date="
								form.formModel.is_voting_enabled
									? form.formModel.voting_ends_on
									: undefined
							"
						/>
						<AppFormControlErrors />
					</template>

					<template v-else>
						<AppCommunityCompetitionDate
							:date="model.ends_on"
							:timezone="model.timezone"
						/>

						<p class="help-block">
							<AppTranslate>Your jam ended on this date and time.</AppTranslate>
						</p>
					</template>
				</AppFormGroup>
			</template>

			<template v-else>
				<AppLoading centered />
			</template>
		</fieldset>

		<AppFormButton
			v-if="shouldShowSaveButton"
			show-when-valid
			:disabled="!timezoneService || !timezoneService.loaded"
		>
			<AppTranslate>Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
