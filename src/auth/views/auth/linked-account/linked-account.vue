<script lang="ts">
import { defineAppRouteOptions } from '../../../../_common/route/route-component';

export default {
	name: 'RouteAuthLinkedAccount',
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
import { RouterView } from 'vue-router';
import { createAppRoute } from '../../../../_common/route/route-component';

createAppRoute({});
</script>

<template>
	<RouterView />
</template>
