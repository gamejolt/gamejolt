<script lang="ts">
import FormFinancialsMarketplace from '~app/components/forms/financials/FormFinancialsMarketplace.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<FormFinancialsMarketplace />
</template>
