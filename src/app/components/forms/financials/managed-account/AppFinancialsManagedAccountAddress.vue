<script lang="ts" setup>
import { Geo } from '../../../../../_common/geo/geo.service';
import { useFormManagedAccount } from './managed-account.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormControlSelect from '../../../../../_common/form-vue/controls/AppFormControlSelect.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';

defineProps({
	namePrefix: {
		type: String,
		required: true,
	},
});

const { requiresField, getStripeField, account } = useFormManagedAccount()!;
const countries = Geo.getCountries();
</script>

<template>
	<div v-if="requiresField(namePrefix + '.line1')">
		<div v-if="!getStripeField(namePrefix + '.line1')">
			<AppFormGroup
				v-if="requiresField(namePrefix + '.line1')"
				:name="`${namePrefix}.line1`"
				:label="$gettext('Address')"
			>
				<AppFormControl />
				<AppFormControlErrors />
			</AppFormGroup>

			<AppFormGroup
				v-if="requiresField(namePrefix + '.line1')"
				:name="`${namePrefix}.line2`"
				:label="$gettext('Apartment/Suite/Unit')"
				:optional="true"
			>
				<AppFormControl />
				<AppFormControlErrors />
			</AppFormGroup>

			<!--
				We only ask for their country if this is an additional owner.
				Additional owners can live in any country.
			-->
			<AppFormGroup
				v-if="requiresField(namePrefix + '.country')"
				:name="`${namePrefix}.country`"
				:label="$gettext('Country')"
			>
				<AppFormControlSelect>
					<option
						v-for="country of countries"
						:key="country.code"
						:value="country.code.toUpperCase()"
					>
						{{ country.name }}
					</option>
				</AppFormControlSelect>
				<AppFormControlErrors />
			</AppFormGroup>

			<div v-if="requiresField(namePrefix + '.city')" class="row">
				<div class="col-sm-4">
					<AppFormGroup :name="`${namePrefix}.city`" :label="$gettext('City')">
						<AppFormControl />
						<AppFormControlErrors />
					</AppFormGroup>
				</div>
				<div v-if="requiresField(namePrefix + '.state')" class="col-sm-4">
					<AppFormGroup
						:name="`${namePrefix}.state`"
						:label="$gettext('State/Province/County')"
					>
						<AppFormControl />
						<AppFormControlErrors />
					</AppFormGroup>
				</div>
				<div v-if="requiresField(namePrefix + '.postal_code')" class="col-sm-4">
					<AppFormGroup
						:name="`${namePrefix}.postal_code`"
						:label="$gettext('Zip/Postal Code')"
					>
						<AppFormControl />
						<AppFormControlErrors />
					</AppFormGroup>
				</div>
			</div>
		</div>

		<div v-if="getStripeField(namePrefix + '.line1')" class="form-horizontal">
			<div class="form-group">
				<label class="control-label col-sm-4">
					<AppTranslate>Address</AppTranslate>
				</label>
				<div class="form-static col-sm-8">
					<div>{{ getStripeField(namePrefix + '.line1') }}</div>
					<div v-if="getStripeField(namePrefix + '.line2')">
						{{ getStripeField(namePrefix + '.line2') }}
					</div>
					<div>{{ getStripeField(namePrefix + '.city') }}</div>
					<div v-if="getStripeField(namePrefix + '.state')">
						{{ getStripeField(namePrefix + '.state') }}
					</div>

					<div v-if="getStripeField(namePrefix + '.country')">
						{{ Geo.getCountryName(getStripeField(namePrefix + '.country')) }}
					</div>
					<div v-if="!getStripeField(namePrefix + '.country')">
						{{ Geo.getCountryName(account.country_code) }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
