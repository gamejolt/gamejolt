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

<script lang="ts" src="./company-details"></script>
