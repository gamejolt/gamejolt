<script lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import { User } from '../../../../_common/user/user.model';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { routeDashAccountReferrals } from './referrals/referrals.route';

export default {
	...defineAppRouteOptions({
		resolver: () => User.touch(),
	}),
};
</script>

<script lang="ts" setup>
const { user } = useCommonStore();

createAppRoute({
	routeTitle: computed(() => $gettext(`Account settings`)),
});
</script>

<template>
	<div>
		<AppPageHeader>
			<h1>
				{{ $gettext(`Account settings`) }}
			</h1>
		</AppPageHeader>

		<nav>
			<div class="list-group">
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.edit' }"
					active-class="active"
				>
					{{ $gettext(`Profile`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.device-settings' }"
					active-class="active"
				>
					{{ $gettext(`Device settings`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.blocks' }"
					active-class="active"
				>
					{{ $gettext(`Blocked users`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.linked-accounts' }"
					active-class="active"
				>
					{{ $gettext(`Linked accounts`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.email-preferences' }"
					active-class="active"
				>
					{{ $gettext(`Email preferences`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.change-password' }"
					active-class="active"
				>
					{{ $gettext(`Password`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.chat-commands' }"
					active-class="active"
				>
					{{ $gettext(`Chat commands`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.chat-timers' }"
					active-class="active"
				>
					{{ $gettext(`Chat timers`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.payment-methods' }"
					active-class="active"
				>
					{{ $gettext(`Payment methods`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.addresses' }"
					active-class="active"
				>
					{{ $gettext(`Saved addresses`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.purchases.list' }"
					active-class="active"
				>
					{{ $gettext(`Purchases`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.financials' }"
					active-class="active"
				>
					{{ $gettext(`Marketplace account setup`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.wallet' }"
					active-class="active"
				>
					{{ $gettext(`Wallet`) }}
				</RouterLink>
				<RouterLink
					v-if="user?.is_creator"
					class="list-group-item"
					:to="{ name: routeDashAccountReferrals.name }"
					active-class="active"
				>
					{{ $gettext(`Referrals`) }}
				</RouterLink>
				<RouterLink
					class="list-group-item"
					:to="{ name: 'dash.account.site' }"
					active-class="active"
				>
					{{ $gettext(`Portfolio site`) }}
				</RouterLink>
			</div>
		</nav>
	</div>
</template>
