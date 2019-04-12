<template>
	<div>
		<div v-if="!parent.getStripeField(namePrefix + '.year')">
			<div>
				<label class="control-label"><translate>Date of Birth</translate></label>
			</div>

			<div class="row">
				<div class="col-sm-4" v-if="parent.requiresField(namePrefix + '.month') || forceRequired">
					<app-form-group
						:name="`${namePrefix}.month`"
						:label="$gettext('Month')"
						:hideLabel="true"
					>
						<app-form-control-select>
							<option value=""><translate>Month</translate></option>
							<option value="1"><translate>January</translate></option>
							<option value="2"><translate>February</translate></option>
							<option value="3"><translate>March</translate></option>
							<option value="4"><translate>April</translate></option>
							<option value="5"><translate>May</translate></option>
							<option value="6"><translate>June</translate></option>
							<option value="7"><translate>July</translate></option>
							<option value="8"><translate>August</translate></option>
							<option value="9"><translate>September</translate></option>
							<option value="10"><translate>October</translate></option>
							<option value="11"><translate>November</translate></option>
							<option value="12"><translate>December</translate></option>
						</app-form-control-select>

						<app-form-control-errors />
					</app-form-group>
				</div>
				<div class="col-sm-4" v-if="parent.requiresField(namePrefix + '.day') || forceRequired">
					<app-form-group :name="`${namePrefix}.day`" :label="$gettext('Day')" :hideLabel="true">
						<app-form-control-select>
							<option value=""><translate>Day</translate></option>
							<option v-for="i of days" :value="i">
								{{ i }}
							</option>
						</app-form-control-select>

						<app-form-control-errors />
					</app-form-group>
				</div>
				<div class="col-sm-4" v-if="parent.requiresField(namePrefix + '.year') || forceRequired">
					<app-form-group :name="`${namePrefix}.year`" :label="$gettext('Year')" :hideLabel="true">
						<app-form-control-select>
							<option value=""><translate>Year</translate></option>
							<option v-for="i of years" :value="i">
								{{ i }}
							</option>
						</app-form-control-select>

						<app-form-control-errors />
					</app-form-group>
				</div>
			</div>
		</div>

		<div class="form-horizontal" v-if="parent.getStripeField(namePrefix + '.year')">
			<div class="form-group">
				<label class="control-label col-sm-4">
					<translate>Date of Birth</translate>
				</label>
				<div class="form-static col-sm-8">
					<translate>Provided</translate>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./dob"></script>
