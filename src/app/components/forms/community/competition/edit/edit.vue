<script lang="ts" src="./edit"></script>

<template>
	<app-form name="communityCompetitionFormEdit">
		<fieldset>
			<app-form-legend>
				<translate>Date and Time</translate>
			</app-form-legend>

			<template v-if="timezoneService && timezoneService.loaded">
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
							<translate>
								All time selection below are using this timezone.
							</translate>
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
							:rules="{
								min_date: timezoneService.now,
								max_date: formModel.ends_on,
							}"
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
							:rules="endsOnControlRules"
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

		<app-form-button v-if="shouldShowSaveButton" :disabled="!valid || !timezoneService.loaded">
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>
