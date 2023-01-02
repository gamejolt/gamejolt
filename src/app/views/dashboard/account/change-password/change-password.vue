<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import FormChangePassword from '../../../../components/forms/change-password/change-password.vue';
import { useAccountRouteController } from '../RouteDashAccount.vue';

@Options({
	name: 'RouteDashAccountChangePassword',
	components: {
		FormChangePassword,
	},
})
@OptionsForRoute({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/account/has-password'),
})
export default class RouteDashAccountChangePassword extends BaseRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);

	hasPassword = true;

	get routeTitle() {
		return this.routeStore.heading;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`Change Password`);
	}

	routeResolved($payload: any) {
		this.hasPassword = $payload.hasPassword;
	}
}
</script>

<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<FormChangePassword :requires-old="hasPassword" @submit="hasPassword = true" />
		</div>
	</div>
</template>
