<template>
	<div class="row" v-if="isRouteBootstrapped">
		<template v-if="hasPaymentSources">
			<div v-for="paymentSource of paymentSources" :key="paymentSource.id" class="col-md-6">
				<app-user-payment-source-card
					:payment-source="paymentSource"
					show-remove
					@remove="onRemove(paymentSource)"
				/>
			</div>
		</template>
		<template v-else>
			<div class="col-md-6 col-centered">
				<p class="lead text-center">
					<translate>You do not have any payment methods saved yet.</translate>
				</p>
			</div>
		</template>
	</div>
</template>

<script lang="ts" src="./payment-methods" />
