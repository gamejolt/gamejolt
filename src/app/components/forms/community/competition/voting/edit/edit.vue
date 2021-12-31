<script lang="ts" src="./edit"></script>

<template>
	<div>
		<div v-if="isInitial" class="alert alert-notice">
			<translate>
				You must fill out the form below and save it before voting will be enabled.
			</translate>
		</div>

		<app-form :controller="form">
			<template v-if="timezoneService && timezoneService.loaded">
				<app-form-group name="voting_ends_on" :label="$gettext(`Voting End Date and Time`)">
					<p class="help-block">
						<span v-translate>
							Voting starts when the jam ends and continues until the date and time
							you choose below.
							<i>You can change this anytime before voting ends.</i>
						</span>
					</p>

					<app-form-control-date
						:timezone-offset="timezoneService.activeTimezoneOffset"
						:validators="[validateMinDate(formModel.ends_on)]"
					/>
					<app-form-control-errors />
				</app-form-group>

				<template v-if="canEditDetails">
					<fieldset>
						<app-form-legend>
							<translate>Community Voting</translate>
						</app-form-legend>

						<p class="help-block">
							<translate>
								This allows members of the community to judge jam entries by rating
								them. You can specify who can vote and the type of voting below. At
								the end of the voting period, the ratings will be tallied and the
								entries will be ranked.
							</translate>
						</p>

						<app-form-group name="has_community_voting" hide-label>
							<app-form-control-toggle />
						</app-form-group>

						<template v-if="formModel.has_community_voting">
							<app-form-group
								name="voting_user_restriction"
								:label="$gettext(`Who can vote?`)"
							>
								<div
									v-for="option of votingUserRestrictionOptions"
									:key="option.radioValue"
									class="radio"
								>
									<label>
										<app-form-control-radio
											type="radio"
											:value="option.radioValue"
										/>
										{{ option.text }}
										<span v-if="option.helpText" class="help-inline">
											- {{ option.helpText }}
										</span>
									</label>
								</div>
							</app-form-group>
							<app-form-group name="voting_type">
								<div
									v-for="option of votingTypeOptions"
									:key="option.radioValue"
									class="radio"
								>
									<label>
										<app-form-control-radio
											type="radio"
											:value="option.radioValue"
										/>
										{{ option.text }}
										<span v-if="option.helpText" class="help-inline">
											- {{ option.helpText }}
										</span>
									</label>
								</div>
							</app-form-group>
						</template>
					</fieldset>

					<fieldset>
						<app-form-legend>
							<translate>Awards</translate>
						</app-form-legend>

						<p class="help-block">
							<translate>
								This lets you create awards and then choose entries to receive them.
								Awards can be added and assigned at any time, but we recommend
								assigning them during the voting period. After voting, award-winning
								entries will be displayed by default at the top of the Games page.
							</translate>
						</p>

						<app-form-group name="has_awards" hide-label>
							<app-form-control-toggle />
						</app-form-group>
					</fieldset>

					<div v-if="!isVotingValid" class="alert alert-notice">
						<translate>
							If you have voting on, you must enable either community voting or
							awards, or both.
						</translate>
					</div>
				</template>

				<app-form-button :disabled="!isValid">
					<translate>Save</translate>
				</app-form-button>
				<app-button @click="onClickCancel">
					<translate>Cancel</translate>
				</app-button>
			</template>

			<template v-else>
				<app-loading centered />
			</template>
		</app-form>
	</div>
</template>

<style lang="stylus" scoped></style>
