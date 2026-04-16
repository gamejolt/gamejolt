<script lang="ts" setup>
import { ref, toRef } from 'vue';

import { useForm } from '../../../../../_common/form-vue/AppForm.vue';
import AppFinancialsManagedAccountAddress from './AppFinancialsManagedAccountAddress.vue';
import AppFinancialsManagedAccountContact from './AppFinancialsManagedAccountContact.vue';
import AppFinancialsManagedAccountDob from './AppFinancialsManagedAccountDob.vue';
import AppFinancialsManagedAccountDocument, {
	AppFinancialsManagedAccountDocumentInterface,
} from './AppFinancialsManagedAccountDocument.vue';
import AppFinancialsManagedAccountName from './AppFinancialsManagedAccountName.vue';
import AppFinancialsManagedAccountSsn from './AppFinancialsManagedAccountSsn.vue';
import { ManagedAccountFormModel } from './FormFinancialsManagedAccount.vue';

export interface AppFinancialsManagedAccountPersonInterface {
	namePrefix: string;
	uploadDocuments: (stripePublishableKey: string) => Promise<[string, string]>;
}

type Props = {
	namePrefix: string;
	countryCode?: string;
};
const { namePrefix, countryCode } = defineProps<Props>();

const namePrefixRef = toRef(() => namePrefix);
const form = useForm<ManagedAccountFormModel>()!;

const idDocument = ref<AppFinancialsManagedAccountDocumentInterface>();
const additionalDocument = ref<AppFinancialsManagedAccountDocumentInterface>();

async function uploadDocuments(stripePublishableKey: string) {
	let idDocumentRequest: Promise<string> = Promise.resolve('');
	let additionalDocumentRequest: Promise<string> = Promise.resolve('');

	if (form.formModel[`${namePrefix}.verification.status`] !== 'verified') {
		if (form.formModel[`${namePrefix}.verification.document.front`]) {
			idDocumentRequest = idDocument.value!.uploadDocument(stripePublishableKey);
		}

		if (form.formModel[`${namePrefix}.verification.additional_document.front`]) {
			additionalDocumentRequest =
				additionalDocument.value!.uploadDocument(stripePublishableKey);
		}
	}

	return Promise.all([idDocumentRequest, additionalDocumentRequest]);
}

defineExpose({
	namePrefix: namePrefixRef,
	uploadDocuments,
});
</script>

<template>
	<div>
		<!--
			Personal Name
		-->
		<AppFinancialsManagedAccountName :name-prefix="namePrefix" />

		<!--
			Personal DOB
		-->
		<AppFinancialsManagedAccountDob :name-prefix="`${namePrefix}.dob`" />

		<!--
			Personal Address
			Some times required for individual accounts in GB too.
		-->
		<AppFinancialsManagedAccountAddress
			:name-prefix="`${namePrefix}.address`"
			:country-code="countryCode"
		/>

		<!--
			Contact info (email and phone)
		-->
		<AppFinancialsManagedAccountContact :name-prefix="namePrefix" />

		<!--
			SSN
		-->
		<AppFinancialsManagedAccountSsn v-if="countryCode" :name-prefix="namePrefix" :country-code="countryCode" />

		<!--
			Personal ID Verification
		-->
		<AppFinancialsManagedAccountDocument
			ref="idDocument"
			type="id"
			:name-prefix="`${namePrefix}.verification`"
		/>

		<!--
			Additional Verification Document
			A utility bill that proves the user's address.
		-->
		<AppFinancialsManagedAccountDocument
			ref="additionalDocument"
			type="additional"
			:name-prefix="`${namePrefix}.verification`"
		/>
	</div>
</template>
