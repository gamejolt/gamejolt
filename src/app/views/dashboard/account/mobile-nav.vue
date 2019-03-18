<template>
	<div>
		<app-page-header>
			<h1>
				<translate>Manage Account</translate>
			</h1>
		</app-page-header>

		<nav>
			<div class="list-group">
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.edit' }"
					active-class="active"
				>
					<translate>Profile</translate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.site' }"
					active-class="active"
				>
					<translate>Portfolio Site</translate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.linked-accounts' }"
					active-class="active"
				>
					<translate>Linked Accounts</translate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.email-preferences' }"
					active-class="active"
				>
					<translate>Email Preferences</translate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.change-password' }"
					active-class="active"
				>
					<translate>Password</translate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.payment-methods' }"
					active-class="active"
				>
					<translate>Payment Methods</translate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.addresses' }"
					active-class="active"
				>
					<translate>Saved Addresses</translate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.purchases.list' }"
					active-class="active"
				>
					<translate>Purchases</translate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.financials' }"
					active-class="active"
				>
					<translate>Marketplace Account Setup</translate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.withdraw-funds' }"
					active-class="active"
				>
					<translate>Revenue</translate>
				</router-link>
			</div>
		</nav>
	</div>
</template>

<script lang="ts" src="./mobile-nav" />
