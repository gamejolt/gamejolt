<template>
	<app-card class="payment-source-credit-card">
		<a class="card-remove" @click="remove()" v-if="showRemove">
			<app-jolticon icon="remove" />
		</a>

		<div class="-icon">
			<app-jolticon icon="credit-card" big />
		</div>

		<div class="-body">
			<div class="card-title">
				<h5>
					<translate>Credit Card</translate>
				</h5>
			</div>

			<div class="card-content">
				<div>
					<span class="tag">
						{{ paymentSource.brand }}
					</span>
					****
					{{ paymentSource.last4 }}

					<span class="dot-separator" />
					{{ expires }}
				</div>

				<template v-if="paymentSource.user_address">
					<br />
					<app-user-address-details :address="paymentSource.user_address" />
				</template>
			</div>
		</div>
	</app-card>
</template>

<style lang="stylus" scoped>
.-icon
	float: left

.-body
	margin-left: 70px
</style>

<script lang="ts" src="./card" />
