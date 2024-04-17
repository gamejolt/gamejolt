<script lang="ts">
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';

export default {
	...defineAppRouteOptions({
		deps: {},
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<RouterView />
</template>
