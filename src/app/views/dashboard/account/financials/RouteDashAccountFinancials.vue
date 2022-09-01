<script lang="ts">
import { computed } from 'vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import FormFinancials from '../../../../components/forms/financials/FormFinancials.vue';
import { useAccountRouteController } from '../RouteDashAccount.vue';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;
const routeTitle = computed(() => $gettext(`Marketplace Account Setup`));

createAppRoute({
	routeTitle,
	onInit() {
		heading.value = routeTitle.value;
	},
});
</script>

<template>
	<div class="row">
		<div class="col-md-9 col-lg-8">
			<FormFinancials />
		</div>
	</div>
</template>
