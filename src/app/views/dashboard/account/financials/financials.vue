<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { BaseRouteComponent } from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import FormFinancials from '../../../../components/forms/financials/financials.vue';
import { useAccountRouteController } from '../account.vue';

@Options({
	name: 'RouteDashAccountFinancials',
	components: {
		FormFinancials,
	},
})
export default class RouteDashAccountFinancials extends BaseRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);

	get routeTitle() {
		return this.routeStore.heading;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`Marketplace Account Setup`);
	}
}
</script>

<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<form-financials />
		</div>
	</div>
</template>
