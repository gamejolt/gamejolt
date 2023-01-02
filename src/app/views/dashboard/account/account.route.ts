import { RouteRecordRaw } from 'vue-router';
import { routeDashAccountAddresses } from './addresses/addresses.route';
import { routeDashAccountBlocks } from './blocks/blocks.route';
import { routeDashAccountChangePassword } from './change-password/change-password.route';
import { routeDashAccountChatCommands } from './chat-commands/chat-commands.route';
import { routeDashAccountChatTimers } from './chat-timers/chat-timers.route';
import { routeDashAccountDeviceSettings } from './device-settings/device-settings.route';
import { routeDashAccountEdit } from './edit/edit.route';
import { routeDashAccountEmailPreferences } from './email-preferences/email-preferences.route';
import { routeDashAccountFinancials } from './financials/financials.route';
import { routeDashAccountLinkedAccountsLinkCallback } from './linked-accounts/link-callback/link-callback.route';
import { routeDashAccountLinkedAccounts } from './linked-accounts/linked-accounts.route';
import { routeDashAccountPaymentMethods } from './payment-methods/payment-methods.route';
import { routeDashAccountPurchasesList } from './purchases/list/list.route';
import { routeDashAccountPurchasesView } from './purchases/view/view.route';
import { routeDashAccountSite } from './site/site.route';
import { routeDashAccountWallet } from './wallet/wallet.route';

export const routeDashAccount: RouteRecordRaw = {
	path: '',
	component: () => import('./RouteDashAccount.vue'),
	children: [
		routeDashAccountEdit,
		routeDashAccountEmailPreferences,
		routeDashAccountChangePassword,
		routeDashAccountLinkedAccounts,
		routeDashAccountLinkedAccountsLinkCallback,
		routeDashAccountFinancials,
		routeDashAccountPaymentMethods,
		routeDashAccountAddresses,
		routeDashAccountPurchasesList,
		routeDashAccountPurchasesView,
		routeDashAccountSite,
		routeDashAccountWallet,
		routeDashAccountBlocks,
		routeDashAccountDeviceSettings,
		routeDashAccountChatCommands,
		routeDashAccountChatTimers,
	],
};
