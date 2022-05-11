<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import AppPageHeader from '../../../components/page-header/page-header.vue';

@Options({
	components: {
		AppPageHeader,
	},
})
export default class RouteDashAccountMobileNav extends Vue {}
</script>

<template>
	<div>
		<AppPageHeader>
			<h1>
				<AppTranslate>Manage Account</AppTranslate>
			</h1>
		</AppPageHeader>

		<nav>
			<div class="list-group">
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.edit' }"
					active-class="active"
				>
					<AppTranslate>Profile</AppTranslate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.device-settings' }"
					active-class="active"
				>
					<AppTranslate>Device Settings</AppTranslate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.blocks' }"
					active-class="active"
				>
					<AppTranslate>Blocked Users</AppTranslate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.linked-accounts' }"
					active-class="active"
				>
					<AppTranslate>Linked Accounts</AppTranslate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.email-preferences' }"
					active-class="active"
				>
					<AppTranslate>Email Preferences</AppTranslate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.change-password' }"
					active-class="active"
				>
					<AppTranslate>Password</AppTranslate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.payment-methods' }"
					active-class="active"
				>
					<AppTranslate>Payment Methods</AppTranslate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.addresses' }"
					active-class="active"
				>
					<AppTranslate>Saved Addresses</AppTranslate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.purchases.list' }"
					active-class="active"
				>
					<AppTranslate>Purchases</AppTranslate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.financials' }"
					active-class="active"
				>
					<AppTranslate>Marketplace Account Setup</AppTranslate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.withdraw-funds' }"
					active-class="active"
				>
					<AppTranslate>Revenue</AppTranslate>
				</router-link>
				<router-link
					class="list-group-item"
					:to="{ name: 'dash.account.site' }"
					active-class="active"
				>
					<AppTranslate>Portfolio Site</AppTranslate>
				</router-link>
			</div>
		</nav>
	</div>
</template>
