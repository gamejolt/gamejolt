<script lang="ts">
import { inject, InjectionKey, provide, ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { bangRef } from '../../../../utils/vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppEditableOverlay from '../../../../_common/editable-overlay/AppEditableOverlay.vue';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import AppMediaItemCover from '../../../../_common/media-item/cover/cover.vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { UserAvatarModal } from '../../../components/user/avatar-modal/avatar-modal.service';
import { UserHeaderModal } from '../../../components/user/header-modal/header-modal.service';
import { routeDashAccountAddresses } from './addresses/addresses.route';
import { routeDashAccountBlocks } from './blocks/blocks.route';
import { routeDashAccountChangePassword } from './change-password/change-password.route';
import { routeDashAccountChatCommands } from './chat-commands/chat-commands.route';
import { routeDashAccountChatMods } from './chat-mods/chat-mods.route';
import { routeDashAccountChatTimers } from './chat-timers/chat-timers.route';
import { routeDashAccountDeviceSettings } from './device-settings/device-settings.route';
import { routeDashAccountEdit } from './edit/edit.route';
import { routeDashAccountEmailPreferences } from './email-preferences/email-preferences.route';
import { routeDashAccountFinancials } from './financials/financials.route';
import { routeDashAccountLinkedAccounts } from './linked-accounts/linked-accounts.route';
import { routeDashAccountMobileNav } from './mobile-nav.route';
import { routeDashAccountPaymentMethods } from './payment-methods/payment-methods.route';
import { routeDashAccountPurchasesList } from './purchases/list/list.route';
import { routeDashAccountReferrals } from './referrals/referrals.route';
import { routeDashAccountSite } from './site/site.route';
import { routeDashAccountWallet } from './wallet/wallet.route';

const Key: InjectionKey<Controller> = Symbol('account-route');

type Controller = ReturnType<typeof createController>;

export function useAccountRouteController() {
	return inject(Key);
}

function createController() {
	const heading = ref('');
	return { heading };
}

export default {
	...defineAppRouteOptions({
		deps: {},
		// We want to reload this data every time we come into this section.
		resolver: () => Api.sendRequest('/web/dash/account'),
	}),
};
</script>

<script lang="ts" setup>
const { user: maybeUser, setUser } = useCommonStore();

const routeStore = createController();
provide(Key, routeStore);

const { heading } = routeStore;
const user = bangRef(maybeUser);

const { isBootstrapped } = createAppRoute({
	onResolved({ payload }) {
		setUser(payload.user);
	},
});

function showEditHeader() {
	UserHeaderModal.show();
}

function showEditAvatar() {
	UserAvatarModal.show();
}
</script>

<template>
	<div>
		<div v-if="Screen.isXs" class="well fill-darker sans-margin-bottom sans-rounded">
			<AppButton block icon="chevron-left" :to="{ name: routeDashAccountMobileNav.name }">
				{{ $gettext(`Back to settings`) }}
			</AppButton>
		</div>

		<AppPageHeader>
			<h1>{{ heading }}</h1>

			<p>
				<small>@{{ user.username }}</small>
			</p>

			<template v-if="!Screen.isXs" #spotlight>
				<AppEditableOverlay
					class="-fill"
					:disabled="$route.name !== routeDashAccountEdit.name"
					@click="showEditAvatar()"
				>
					<template #overlay>
						{{ $gettext(`Change`) }}
					</template>
					<AppUserAvatar :user="user" />
				</AppEditableOverlay>
			</template>
		</AppPageHeader>

		<AppExpand :when="$route.name === routeDashAccountEdit.name">
			<AppEditableOverlay @click="showEditHeader()">
				<template #overlay>
					{{ $gettext(`Change profile header`) }}
				</template>

				<!--
					If no header yet, show their highlight color with a min-height.
				-->
				<div
					class="fill-highlight"
					:style="{
						'min-height': !user.header_media_item ? '200px' : '',
					}"
				>
					<AppMediaItemCover
						v-if="user.header_media_item"
						:media-item="user.header_media_item"
						:max-height="400"
					/>
				</div>
			</AppEditableOverlay>
		</AppExpand>

		<!-- Don't show content before this route has loaded in the account data. -->
		<section v-if="isBootstrapped" class="section">
			<div class="container">
				<div class="row">
					<div v-if="!Screen.isXs" class="col-sm-3 col-md-2">
						<nav class="platform-list">
							<ul>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountEdit.name }"
										active-class="active"
									>
										{{ $gettext(`Profile`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountDeviceSettings.name }"
										active-class="active"
									>
										{{ $gettext(`Device settings`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountBlocks.name }"
										active-class="active"
									>
										{{ $gettext(`Blocked users`) }}
									</RouterLink>
								</li>
							</ul>
							<hr />
							<ul>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountLinkedAccounts.name }"
										active-class="active"
									>
										{{ $gettext(`Linked accounts`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountEmailPreferences.name }"
										active-class="active"
									>
										{{ $gettext(`Email preferences`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountChangePassword.name }"
										active-class="active"
									>
										{{ $gettext(`Password`) }}
									</RouterLink>
								</li>
							</ul>
							<hr />
							<ul>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountChatCommands.name }"
										active-class="active"
									>
										{{ $gettext(`Chat commands`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountChatTimers.name }"
										active-class="active"
									>
										{{ $gettext(`Chat timers`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountChatMods.name }"
										active-class="active"
									>
										{{ $gettext(`Chat moderators`) }}
									</RouterLink>
								</li>
							</ul>
							<hr />
							<ul>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountPaymentMethods.name }"
										active-class="active"
									>
										{{ $gettext(`Payment methods`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountAddresses.name }"
										active-class="active"
									>
										{{ $gettext(`Saved addresses`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountPurchasesList.name }"
										active-class="active"
									>
										{{ $gettext(`Purchases`) }}
									</RouterLink>
								</li>
							</ul>
							<hr />
							<ul>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountFinancials.name }"
										active-class="active"
									>
										{{ $gettext(`Marketplace account setup`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountWallet.name }"
										active-class="active"
									>
										{{ $gettext(`Wallet`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountReferrals.name }"
										active-class="active"
									>
										{{ $gettext(`Referrals`) }}
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: routeDashAccountSite.name }"
										active-class="active"
									>
										{{ $gettext(`Portfolio site`) }}
									</RouterLink>
								</li>
							</ul>
						</nav>
					</div>
					<div class="col-xs-12 col-sm-9 col-md-10">
						<template v-if="Screen.isXs && $route.name === routeDashAccountEdit.name">
							<AppEditableOverlay class="-avatar-xs" @click="showEditAvatar()">
								<template #overlay>
									{{ $gettext(`Change`) }}
								</template>
								<AppUserAvatar :user="user" />
							</AppEditableOverlay>

							<hr />
						</template>

						<RouterView />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<style lang="stylus" scoped>
.-fill
	position: absolute
	top: 0
	right: 0
	bottom: 0
	left: 0

.-avatar-xs
	margin: 0 auto
	max-width: 200px
	border-radius: 50%
	overflow: hidden
</style>
