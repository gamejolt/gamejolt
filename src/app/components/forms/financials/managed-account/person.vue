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
		<!-- <app-financials-managed-account-document
			ref="id-document"
			type="id"
			:namePrefix="`${namePrefix}.verification`"
		/> -->

		<!--
			Additional Verification Document
			A utility bill that proves the user's address.
		-->
		<!-- <app-financials-managed-account-document
			ref="additional-document"
			type="additional"
			:namePrefix="`${namePrefix}.verification`"
		/> -->
	</div>
</template>

<script lang="ts" src="./person"></script>
