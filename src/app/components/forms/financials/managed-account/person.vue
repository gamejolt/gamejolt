<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../../utils/vue';
import { CommonFormComponents } from '../../../../../_common/form-vue/form-common';
import AppFinancialsManagedAccountAddress from './address.vue';
import AppFinancialsManagedAccountContact from './contact.vue';
import AppFinancialsManagedAccountDob from './dob.vue';
import AppFinancialsManagedAccountDocumentTS from './document';
import AppFinancialsManagedAccountDocument from './document.vue';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';
import AppFinancialsManagedAccountName from './name.vue';
import AppFinancialsManagedAccountSsn from './ssn.vue';

@Options({
	components: {
		...CommonFormComponents,
		AppFinancialsManagedAccountName,
		AppFinancialsManagedAccountDob,
		AppFinancialsManagedAccountAddress,
		AppFinancialsManagedAccountContact,
		AppFinancialsManagedAccountSsn,
		AppFinancialsManagedAccountDocument,
	},
})
export default class AppFinancialsManagedAccountPerson extends Vue {
	@Prop({ type: String, required: true }) namePrefix!: string;

	@Prop({ type: String, default: null }) countryCode!: string | null;

	parent: FormFinancialsManagedAccountTS = null as any;

	declare $refs: {
		'id-document': AppFinancialsManagedAccountDocumentTS;
		'additional-document': AppFinancialsManagedAccountDocumentTS;
	};

	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;
	}

	async uploadDocuments(stripePublishableKey: string) {
		let idDocumentRequest: Promise<string> = Promise.resolve('');
		let additionalDocumentRequest: Promise<string> = Promise.resolve('');

		if (this.parent.formModel[`${this.namePrefix}.verification.status`] !== 'verified') {
			if (this.parent.formModel[`${this.namePrefix}.verification.document.front`]) {
				idDocumentRequest = this.$refs['id-document'].uploadDocument(stripePublishableKey);
			}

			if (
				this.parent.formModel[`${this.namePrefix}.verification.additional_document.front`]
			) {
				additionalDocumentRequest =
					this.$refs['additional-document'].uploadDocument(stripePublishableKey);
			}
		}

		return Promise.all([idDocumentRequest, additionalDocumentRequest]);
	}
}
</script>

<template>
	<div>
		<!--
			Personal Name
		-->
		<app-financials-managed-account-name :namePrefix="namePrefix" />

		<!--
			Personal DOB
		-->
		<app-financials-managed-account-dob :namePrefix="`${namePrefix}.dob`" />

		<!--
			Personal Address
			Some times required for individual accounts in GB too.
		-->
		<app-financials-managed-account-address
			:namePrefix="`${namePrefix}.address`"
			:country-code="countryCode"
		/>

		<!--
			Contact info (email and phone)
		-->
		<app-financials-managed-account-contact :namePrefix="namePrefix" />

		<!--
			SSN
		-->
		<app-financials-managed-account-ssn :namePrefix="namePrefix" :country-code="countryCode" />

		<!--
			Personal ID Verification
		-->
		<app-financials-managed-account-document
			ref="id-document"
			type="id"
			:namePrefix="`${namePrefix}.verification`"
		/>

		<!--
			Additional Verification Document
			A utility bill that proves the user's address.
		-->
		<app-financials-managed-account-document
			ref="additional-document"
			type="additional"
			:namePrefix="`${namePrefix}.verification`"
		/>
	</div>
</template>
