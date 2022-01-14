<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../../../utils/vue';
import { CommonFormComponents } from '../../../../../_common/form-vue/form-common';
import AppFinancialsManagedAccountAddress from './address.vue';
import AppFinancialsManagedAccountBusiness from './business.vue';
import AppFinancialsManagedAccountContact from './contact.vue';
import FormFinancialsManagedAccountTS from './managed-account';
import FormFinancialsManagedAccount from './managed-account.vue';

@Options({
	components: {
		...CommonFormComponents,
		AppFinancialsManagedAccountBusiness,
		AppFinancialsManagedAccountAddress,
		AppFinancialsManagedAccountContact,
	},
})
export default class AppFinancialsManagedAccountCompanyDetails extends Vue {
	parent: FormFinancialsManagedAccountTS = null as any;

	created() {
		this.parent = findRequiredVueParent(
			this,
			FormFinancialsManagedAccount
		) as FormFinancialsManagedAccountTS;
	}
}
</script>

<template>
	<div>
		<!--
			Company name and tax ID
			Note: This is equivalent to the individual's account-name and ssn components.
		-->
		<app-financials-managed-account-business />

		<!--
			Business Address
			It uses the legal entity address.
		-->
		<app-financials-managed-account-address namePrefix="company.address" />

		<!--
			Contact info (email and phone)
		-->
		<app-financials-managed-account-contact namePrefix="company" />
	</div>
</template>
