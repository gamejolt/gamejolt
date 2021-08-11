<script lang="ts" src="./addresses"></script>

<template>
	<div v-if="isRouteBootstrapped">
		<div v-if="billingAddresses.length > 0" class="row">
			<div v-for="address of billingAddresses" :key="address.id" class="col-md-6">
				<app-user-address-card :address="address" show-remove @remove="onRemove(address)" />
			</div>
		</div>
		<div v-else class="row">
			<div class="col-md-6 col-centered">
				<p class="lead text-center">
					<translate>You do not have any addresses saved yet.</translate>
				</p>
			</div>
		</div>
	</div>
</template>
