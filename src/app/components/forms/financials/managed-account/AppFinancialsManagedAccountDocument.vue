<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { validateFilesize } from '../../../../../_common/form-vue/validators';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { StripeFileUploadUrl, useFormManagedAccount } from './managed-account.vue';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import { useForm } from '../../../../../_common/form-vue/AppForm.vue';

export interface AppFinancialsManagedAccountDocumentInterface {
	uploadDocument: (stripePublishableKey: string) => Promise<string>;
}

const props = defineProps({
	namePrefix: {
		type: String,
		required: true,
	},
	type: {
		type: String as PropType<'id' | 'additional'>,
		required: true,
	},
});

const { namePrefix, type } = toRefs(props);
const { requiresField, getStripeField } = useFormManagedAccount()!;
const form = useForm()!;

const prefix = computed(() => {
	return `${namePrefix.value}.${type.value === 'id' ? 'document' : 'additional_document'}`;
});

const fieldName = computed(() => {
	return type.value === 'id' ? $gettext('ID Document') : $gettext('Utility / Bill');
});

/**
 * Returns the stripe upload id.
 */
function uploadDocument(stripePublishableKey: string) {
	return new Promise<string>((resolve, reject) => {
		const formData = new FormData();
		formData.append('purpose', 'identity_document');

		// TODO(vue3): gotta check if this works
		formData.append('file', form.formModel[`${prefix.value}.front`]);

		const xhr = new XMLHttpRequest();
		xhr.open('POST', StripeFileUploadUrl);
		xhr.setRequestHeader('Authorization', 'Bearer ' + stripePublishableKey);
		xhr.setRequestHeader('Accept', 'application/json'); // Makes sure it doesn't return as JSONP.
		xhr.send(formData);

		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) {
				return;
			}

			try {
				const data = JSON.parse(xhr.responseText);

				if (xhr.status !== 200) {
					throw new Error(data.error?.message || 'Unknown error');
				}

				if (!data.id) {
					throw new Error(`Unexpected response (missing id field): ${xhr.responseText}`);
				}

				resolve(data.id);
			} catch (e) {
				reject(e);
			}
		};
	});
}

defineExpose<AppFinancialsManagedAccountDocumentInterface>({
	uploadDocument,
});
</script>

<template>
	<div v-if="requiresField(prefix)">
		<!--
			It only has a details_code if it failed to verify.
		-->
		<div v-if="!getStripeField(prefix + '.front') || getStripeField(prefix + '.details_code')">
			<hr />

			<div v-if="getStripeField(prefix + '.details')" class="alert">
				<AppJolticon icon="notice" />
				{{ getStripeField(prefix + '.details') }}
			</div>

			<AppFormGroup :name="`${prefix}.front`" :label="fieldName">
				<p class="help-block">
					<AppTranslate v-if="type === 'id'">
						This should be a scan of an ID card, driver's license, passport, or other
						government supplied identification.
					</AppTranslate>
					<AppTranslate v-else>
						This should be a scan or photo of a document verifying the address, such as
						a utility bill.
					</AppTranslate>
					{{ ' ' }}
					<em>
						<AppTranslate>
							Only .png or .jpg is accepted and it must be smaller than 8MB.
						</AppTranslate>
					</em>
				</p>
				<AppFormControlUpload
					ref="documentInput"
					:validators="[validateFilesize(8 * 1024 * 1024)]"
					accept=".png,.jpg,.jpeg"
				/>
				<AppFormControlErrors />
			</AppFormGroup>
		</div>

		<div
			v-if="getStripeField(prefix + '.front') && !getStripeField(prefix + '.details_code')"
			class="form-horizontal"
		>
			<div class="form-group">
				<label class="control-label col-sm-4">
					<AppTranslate>ID Document</AppTranslate>
				</label>
				<div class="form-static col-sm-8">
					<AppTranslate>Provided</AppTranslate>
				</div>
			</div>
		</div>
	</div>
</template>
