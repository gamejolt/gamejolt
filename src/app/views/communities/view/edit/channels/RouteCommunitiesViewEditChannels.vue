<script lang="ts">
import { RouterView } from 'vue-router';

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
	<RouterView />
</template>
