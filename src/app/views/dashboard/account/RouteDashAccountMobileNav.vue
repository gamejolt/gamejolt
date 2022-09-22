<script lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';
import AppPageHeader from '../../../components/page-header/page-header.vue';

export default {
	...defineAppRouteOptions({
		resolver: () => User.touch(),
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: computed(() => $gettext(`Manage Account`)),
});
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
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.edit' }"
					active-class="active"
				>
					<AppTranslate>Profile</AppTranslate>
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.device-settings' }"
					active-class="active"
				>
					<AppTranslate>Device Settings</AppTranslate>
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.blocks' }"
					active-class="active"
				>
					<AppTranslate>Blocked Users</AppTranslate>
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.linked-accounts' }"
					active-class="active"
				>
					<AppTranslate>Linked Accounts</AppTranslate>
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.email-preferences' }"
					active-class="active"
				>
					<AppTranslate>Email Preferences</AppTranslate>
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.change-password' }"
					active-class="active"
				>
					<AppTranslate>Password</AppTranslate>
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.payment-methods' }"
					active-class="active"
				>
					<AppTranslate>Payment Methods</AppTranslate>
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.addresses' }"
					active-class="active"
				>
					<AppTranslate>Saved Addresses</AppTranslate>
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.purchases.list' }"
					active-class="active"
				>
					<AppTranslate>Purchases</AppTranslate>
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.financials' }"
					active-class="active"
				>
					<AppTranslate>Marketplace Account Setup</AppTranslate>
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.wallet' }"
					active-class="active"
				>
					<AppTranslate>Wallet</AppTranslate>
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.site' }"
					active-class="active"
				>
					<AppTranslate>Portfolio Site</AppTranslate>
				</RouterLink>
			</div>
		</nav>
	</div>
</template>
