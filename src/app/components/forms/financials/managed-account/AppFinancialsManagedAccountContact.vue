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

const { getStripeField, requiresField } = useFormManagedAccount()!;
</script>

<template>
	<div>
		<div class="row">
			<div
				v-if="
					!getStripeField(namePrefix + '.email') && requiresField(namePrefix + '.email')
				"
				class="col-sm-6"
			>
				<AppFormGroup :name="`${namePrefix}.email`" :label="$gettext('Email')">
					<AppFormControl type="email" />
					<AppFormControlErrors />
				</AppFormGroup>
			</div>
			<div
				v-if="
					!getStripeField(namePrefix + '.phone') && requiresField(namePrefix + '.phone')
				"
				class="col-sm-6"
			>
				<AppFormGroup
					:name="`${namePrefix}.phone`"
					:label="$gettext('Phone (with country code)')"
				>
					<AppFormControl />
					<AppFormControlErrors />
				</AppFormGroup>
			</div>
		</div>

		<div
			v-if="getStripeField(namePrefix + '.email') || getStripeField(namePrefix + '.phone')"
			class="form-horizontal"
		>
			<div class="form-group">
				<label class="control-label col-sm-4">
					<AppTranslate>Contact</AppTranslate>
				</label>
				<div class="form-static col-sm-8">
					<div v-if="getStripeField(namePrefix + '.email')">
						{{ getStripeField(namePrefix + '.email') }}
					</div>
					<div v-if="getStripeField(namePrefix + '.phone')">
						{{ getStripeField(namePrefix + '.phone') }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
