<script lang="ts">
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import FormFinancialsMarketplace from '../../../../../components/forms/financials/FormFinancialsMarketplace.vue';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<FormFinancialsMarketplace />
</template>
