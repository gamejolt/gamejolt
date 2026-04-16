<script lang="ts" setup>
import { ref, toRef } from 'vue';

import AppFinancialsManagedAccountAddress from '~app/components/forms/financials/managed-account/AppFinancialsManagedAccountAddress.vue';
import AppFinancialsManagedAccountContact from '~app/components/forms/financials/managed-account/AppFinancialsManagedAccountContact.vue';
import AppFinancialsManagedAccountDob from '~app/components/forms/financials/managed-account/AppFinancialsManagedAccountDob.vue';
import AppFinancialsManagedAccountDocument, {
	AppFinancialsManagedAccountDocumentInterface,
} from '~app/components/forms/financials/managed-account/AppFinancialsManagedAccountDocument.vue';
import AppFinancialsManagedAccountName from '~app/components/forms/financials/managed-account/AppFinancialsManagedAccountName.vue';
import AppFinancialsManagedAccountSsn from '~app/components/forms/financials/managed-account/AppFinancialsManagedAccountSsn.vue';
import { ManagedAccountFormModel } from '~app/components/forms/financials/managed-account/FormFinancialsManagedAccount.vue';
import { useForm } from '~common/form-vue/AppForm.vue';

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
