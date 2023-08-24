<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import {
	CommunityCompetitionModel,
	CompetitionPeriodVoting,
} from '../../../../../../_common/community/competition/competition.model';
import { formatDate } from '../../../../../../_common/filters/date';
import AppFormLegend from '../../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlDate from '../../../../../../_common/form-vue/controls/AppFormControlDate.vue';
import { FormTimezoneService } from '../../../../../../_common/form-vue/form-timezone.service';
import { BaseForm } from '../../../../../../_common/form-vue/form.service';
import AppLoading from '../../../../../../_common/loading/AppLoading.vue';
import AppCommunityCompetitionDate from '../../../../community/competition/date/date.vue';

class Wrapper extends BaseForm<CommunityCompetitionModel> {}

@Options({
	components: {
		AppFormLegend,
		AppFormControlDate,
		AppLoading,
		AppCommunityCompetitionDate,
	},
})
export default class FormCommunityCompetitionEdit extends mixins(Wrapper) {
	modelClass = CommunityCompetitionModel;
	timezoneService: FormTimezoneService<CommunityCompetitionModel> | null = null;

	readonly formatDate = formatDate;

	get shouldShowSaveButton() {
		// Before and during the competition, start/end dates can be edited.
		return this.model!.periodNum < CompetitionPeriodVoting;
	}

	async onInit() {
		this.timezoneService = new FormTimezoneService(this.form);
		await this.timezoneService.load(true);
	}
}
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
							<span v-translate>
								All time selection below will use this timezone.
								<i>
									You can't change this once the jam starts, so make sure you've
									set it correctly.
								</i>
							</span>
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
								:label="region"
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
							<span v-translate>
								Your jam begins on this date and time.
								<i>You can change this anytime before the jam starts.</i>
							</span>
						</p>

						<AppFormControlDate
							:timezone-offset="timezoneService.activeTimezoneOffset"
							:min-date="timezoneService.now"
							:max-date="formModel.ends_on"
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
							<span v-translate>
								Your jam ends on this date and time.
								<i>You can change this anytime before the jam ends.</i>
							</span>
						</p>

						<AppFormControlDate
							:timezone-offset="timezoneService.activeTimezoneOffset"
							:min-date="formModel.starts_on"
							:max-date="
								formModel.is_voting_enabled ? formModel.voting_ends_on : undefined
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
