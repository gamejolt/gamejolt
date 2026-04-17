<script lang="ts">
import { RouterView } from 'vue-router';

import { defineAppRouteOptions } from '~common/route/route-component';
import { createAppRoute } from '~common/route/route-component';

export default {
	name: 'RouteAuthLinkedAccount',
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<RouterView />
</template>
