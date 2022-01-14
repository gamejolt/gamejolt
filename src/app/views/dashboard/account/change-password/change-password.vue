<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Translate } from '../../../../../_common/translate/translate.service';
import FormChangePassword from '../../../../components/forms/change-password/change-password.vue';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@Options({
	name: 'RouteDashAccountChangePassword',
	components: {
		FormChangePassword,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/account/has-password'),
	resolveStore() {
		routeStore.commit('setHeading', Translate.$gettext(`dash.change_pass.page_title`));
	},
})
export default class RouteDashAccountChangePassword extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	hasPassword = true;

	get routeTitle() {
		return this.heading;
	}

	routeResolved($payload: any) {
		this.hasPassword = $payload.hasPassword;
	}
}
</script>

<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<form-change-password :requires-old="hasPassword" @submit="hasPassword = true" />
		</div>
	</div>
</template>
