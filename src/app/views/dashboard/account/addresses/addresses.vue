<template>
	<div v-if="isRouteBootstrapped">
		<div v-if="billingAddresses.length > 0" class="row">
			<div class="col-md-6" v-for="address of billingAddresses" :key="address.id">
				<app-user-address-card :address="address" show-remove @remove="onRemove(address)" />
			</div>
		</div>
		<div class="row" v-else>
			<div class="col-md-6 col-centered">
				<p class="lead text-center">
					<translate>You do not have any addresses saved yet.</translate>
				</p>
			</div>
		</div>
	</div>
</template>

<script lang="ts" src="./addresses" />
