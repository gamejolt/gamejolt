<script lang="ts" setup>
import AppFinancialsManagedAccountAddress from './AppFinancialsManagedAccountAddress.vue';
import AppFinancialsManagedAccountBusiness from './AppFinancialsManagedAccountBusiness.vue';
import AppFinancialsManagedAccountContact from './AppFinancialsManagedAccountContact.vue';
</script>

<template>
	<div>
		<!--
			Company name and tax ID
			Note: This is equivalent to the individual's account-name and ssn components.
		-->
		<AppFinancialsManagedAccountBusiness />

		<!--
			Business Address
			It uses the legal entity address.
		-->
		<AppFinancialsManagedAccountAddress name-prefix="company.address" />

		<!--
			Contact info (email and phone)
		-->
		<AppFinancialsManagedAccountContact name-prefix="company" />
	</div>
</template>
