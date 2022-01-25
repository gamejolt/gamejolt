<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import {
	CommunityCompetition,
	CompetitionPeriodVoting,
} from '../../../../../../_common/community/competition/competition.model';
import { formatDate } from '../../../../../../_common/filters/date';
import AppFormLegend from '../../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlDate from '../../../../../../_common/form-vue/controls/AppFormControlDate.vue';
import { FormTimezoneService } from '../../../../../../_common/form-vue/form-timezone.service';
import { BaseForm } from '../../../../../../_common/form-vue/form.service';
import AppLoading from '../../../../../../_common/loading/loading.vue';
import AppCommunityCompetitionDate from '../../../../community/competition/date/date.vue';

class Wrapper extends BaseForm<CommunityCompetition> {}

@Options({
	components: {
		AppFormLegend,
		AppFormControlDate,
		AppLoading,
		AppCommunityCompetitionDate,
	},
})
export default class FormCommunityCompetitionEdit extends mixins(Wrapper) {
	modelClass = CommunityCompetition;
	timezoneService: FormTimezoneService<CommunityCompetition> | null = null;

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
	<app-form :controller="form">
		<fieldset>
			<app-form-legend>
				<translate>Date and Time</translate>
			</app-form-legend>

			<template v-if="model && timezoneService && timezoneService.loaded">
				<template v-if="!model.hasStarted">
					<app-form-group name="timezone" :label="$gettext(`Select a Timezone`)">
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
								<translate>
									Should auto-detect, but if it doesn't, choose your closest city.
								</translate>
							</strong>
						</p>

						<app-form-control-select>
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
						</app-form-control-select>

						<app-form-control-errors />
					</app-form-group>
				</template>
				<template v-else>
					<app-form-group name="timezone" :label="$gettext(`Selected Timezone`)">
						<p class="help-block">
							<translate>All time selection below are using this timezone.</translate>
						</p>
						{{ timezoneService.activeTimezoneName }}
					</app-form-group>
				</template>

				<app-form-group name="starts_on" :label="$gettext(`Start Date and Time`)">
					<template v-if="!model.hasStarted">
						<p class="help-block">
							<span v-translate>
								Your jam begins on this date and time.
								<i>You can change this anytime before the jam starts.</i>
							</span>
						</p>

						<app-form-control-date
							:timezone-offset="timezoneService.activeTimezoneOffset"
							:min-date="timezoneService.now"
							:max-date="formModel.ends_on"
						/>
						<app-form-control-errors />
					</template>

					<template v-else>
						<app-community-competition-date
							:date="model.starts_on"
							:timezone="model.timezone"
						/>

						<p class="help-block">
							<translate>Your jam began on this date and time.</translate>
						</p>
					</template>
				</app-form-group>

				<app-form-group name="ends_on" :label="$gettext(`End Date and Time`)">
					<template v-if="!model.hasEnded">
						<p class="help-block">
							<span v-translate>
								Your jam ends on this date and time.
								<i>You can change this anytime before the jam ends.</i>
							</span>
						</p>

						<app-form-control-date
							:timezone-offset="timezoneService.activeTimezoneOffset"
							:min-date="formModel.starts_on"
							:max-date="
								formModel.is_voting_enabled ? formModel.voting_ends_on : undefined
							"
						/>
						<app-form-control-errors />
					</template>

					<template v-else>
						<app-community-competition-date
							:date="model.ends_on"
							:timezone="model.timezone"
						/>

						<p class="help-block">
							<translate>Your jam ended on this date and time.</translate>
						</p>
					</template>
				</app-form-group>
			</template>

			<template v-else>
				<app-loading centered />
			</template>
		</fieldset>

		<app-form-button
			v-if="shouldShowSaveButton"
			show-when-valid
			:disabled="!timezoneService || !timezoneService.loaded"
		>
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>
