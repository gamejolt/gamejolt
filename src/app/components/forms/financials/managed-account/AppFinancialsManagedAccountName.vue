<script lang="ts" setup>
import { useFormManagedAccount } from './managed-account.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';

defineProps({
	namePrefix: {
		type: String,
		required: true,
	},
});

const { requiresField, getStripeField } = useFormManagedAccount()!;
</script>

<template>
	<div>
		<div v-if="!getStripeField(namePrefix + '.first_name')" class="row">
			<div v-if="requiresField(namePrefix + '.first_name')" class="col-sm-6">
				<AppFormGroup :name="`${namePrefix}.first_name`" :label="$gettext('First Name')">
					<AppFormControl />
					<AppFormControlErrors />
				</AppFormGroup>
			</div>
			<div v-if="requiresField(namePrefix + '.last_name')" class="col-sm-6">
				<AppFormGroup :name="`${namePrefix}.last_name`" :label="$gettext('Last Name')">
					<AppFormControl />
					<AppFormControlErrors />
				</AppFormGroup>
			</div>
		</div>

		<div
			v-if="
				!getStripeField(namePrefix + '.relationship.title') &&
				requiresField(namePrefix + '.relationship.title')
			"
		>
			<AppFormGroup :name="`${namePrefix}.relationship.title`" :label="$gettext('Job Title')">
				<AppFormControl />
				<AppFormControlErrors />
			</AppFormGroup>
		</div>

		<div
			v-if="
				getStripeField(namePrefix + '.first_name') || getStripeField(namePrefix + '.title')
			"
			class="form-horizontal"
		>
			<div v-if="getStripeField(namePrefix + '.first_name')" class="form-group">
				<label class="control-label col-sm-4">
					<AppTranslate>Name</AppTranslate>
				</label>
				<div class="form-static col-sm-8">
					{{ getStripeField(namePrefix + '.first_name') }}
					{{ ' ' }}
					{{ getStripeField(namePrefix + '.last_name') }}
				</div>
			</div>

			<div v-if="getStripeField(namePrefix + '.relationship.title')" class="form-group">
				<label class="control-label col-sm-4">
					<AppTranslate>Job Title</AppTranslate>
				</label>
				<div class="form-static col-sm-8">
					{{ getStripeField(namePrefix + '.relationship.title') }}
				</div>
			</div>
		</div>
	</div>
</template>
