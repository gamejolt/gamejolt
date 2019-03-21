<template>
	<app-form name="userAddressForm">
		<div class="row">
			<div class="col-sm-6">
				<app-form-group name="country" :label="$gettext('Country')">
					<app-form-control-select>
						<option v-for="country of countries" :key="country.code" :value="country.code">
							{{ country.name }}
						</option>
					</app-form-control-select>
					<app-form-control-errors />
				</app-form-group>
			</div>
		</div>

		<app-form-group name="street1" :label="$gettext('Street Address')">
			<app-form-control type="text" />
			<app-form-control-errors />
		</app-form-group>

		<div class="row">
			<div class="col-sm-6">
				<app-form-group name="region" :label="$gettext('State/Province/County')">
					<app-form-control type="text" v-if="!regions" />

					<app-form-control-select v-else>
						<option v-for="region of regions" :key="region.code" :value="region.code">
							{{ region.name }}
						</option>
					</app-form-control-select>

					<app-form-control-errors />
				</app-form-group>
			</div>
			<div class="col-sm-6">
				<app-form-group name="postcode" :label="$gettext('Zip/Postal Code')">
					<app-form-control type="text" />
					<app-form-control-errors />
				</app-form-group>
			</div>
		</div>

		<app-form-button show-when-valid>
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./address" />
