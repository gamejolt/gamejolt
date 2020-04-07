<template>
	<div>
		<div v-if="!parent.getStripeField('company.name')">
			<div class="row">
				<div class="col-sm-6" v-if="parent.requiresField('company.name')">
					<app-form-group name="company.name" :label="$gettext('Business Name')">
						<app-form-control />
						<app-form-control-errors />
					</app-form-group>
				</div>
				<div class="col-sm-6" v-if="parent.requiresField('company.tax_id')">
					<app-form-group name="company.tax_id" :label="$gettext('Employer Identification Number')">
						<app-form-control />
						<app-form-control-errors />
					</app-form-group>
				</div>
			</div>
		</div>

		<div v-if="parent.getStripeField('company.name')" class="form-horizontal">
			<div class="form-group">
				<label class="control-label col-sm-4">
					<translate>Business Name</translate>
				</label>
				<div class="form-static col-sm-8">
					{{ parent.getStripeField('company.name') }}
				</div>
			</div>
			<div class="form-group">
				<label class="control-label col-sm-4">
					<translate>Employer Identification Number</translate>
				</label>
				<div class="form-static col-sm-8">
					<translate>Provided</translate>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./business"></script>
