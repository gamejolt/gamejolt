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
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import AppUserAvatar from '../../../../_common/user/user-avatar/AppUserAvatar.vue';
import AppPageHeader from '../../../components/page-header/page-header.vue';
import { UserAvatarModal } from '../../../components/user/avatar-modal/avatar-modal.service';
import { UserHeaderModal } from '../../../components/user/header-modal/header-modal.service';

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
			<AppButton block icon="chevron-left" :to="{ name: 'dash.account-mobile-nav' }">
				<AppTranslate>Back to Account</AppTranslate>
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
					:disabled="$route.name !== 'dash.account.edit'"
					@click="showEditAvatar()"
				>
					<template #overlay>
						<AppTranslate>Change</AppTranslate>
					</template>
					<AppUserAvatar :user="user" />
				</AppEditableOverlay>
			</template>
		</AppPageHeader>

		<AppExpand :when="$route.name === 'dash.account.edit'">
			<AppEditableOverlay @click="showEditHeader()">
				<template #overlay>
					<AppTranslate>Change Profile Header</AppTranslate>
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
										:to="{ name: 'dash.account.edit' }"
										active-class="active"
									>
										<AppTranslate>Profile</AppTranslate>
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: 'dash.account.device-settings' }"
										active-class="active"
									>
										<AppTranslate>Device Settings</AppTranslate>
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: 'dash.account.blocks' }"
										active-class="active"
									>
										<AppTranslate>Blocked Users</AppTranslate>
									</RouterLink>
								</li>
							</ul>
							<hr />
							<ul>
								<li>
									<RouterLink
										:to="{ name: 'dash.account.linked-accounts' }"
										active-class="active"
									>
										<AppTranslate>Linked Accounts</AppTranslate>
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: 'dash.account.email-preferences' }"
										active-class="active"
									>
										<AppTranslate>Email Preferences</AppTranslate>
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: 'dash.account.change-password' }"
										active-class="active"
									>
										<AppTranslate>Password</AppTranslate>
									</RouterLink>
								</li>
							</ul>
							<hr />
							<ul>
								<li>
									<RouterLink
										:to="{ name: 'dash.account.payment-methods' }"
										active-class="active"
									>
										<AppTranslate>Payment Methods</AppTranslate>
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: 'dash.account.addresses' }"
										active-class="active"
									>
										<AppTranslate>Saved Addresses</AppTranslate>
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: 'dash.account.purchases.list' }"
										active-class="active"
									>
										<AppTranslate>Purchases</AppTranslate>
									</RouterLink>
								</li>
							</ul>
							<hr />
							<ul>
								<li>
									<RouterLink
										:to="{ name: 'dash.account.financials' }"
										active-class="active"
									>
										<AppTranslate>Marketplace Account Setup</AppTranslate>
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: 'dash.account.wallet' }"
										active-class="active"
									>
										<AppTranslate>Wallet</AppTranslate>
									</RouterLink>
								</li>
								<li>
									<RouterLink
										:to="{ name: 'dash.account.site' }"
										active-class="active"
									>
										<AppTranslate>Portfolio Site</AppTranslate>
									</RouterLink>
								</li>
							</ul>
						</nav>
					</div>
					<div class="col-xs-12 col-sm-9 col-md-10">
						<template v-if="Screen.isXs && $route.name === 'dash.account.edit'">
							<AppEditableOverlay class="-avatar-xs" @click="showEditAvatar()">
								<template #overlay>
									<AppTranslate>Change</AppTranslate>
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
