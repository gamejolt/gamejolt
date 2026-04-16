<script lang="ts">
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { touchUser } from '~common/user/user.model';

export default {
	name: 'RouteLibrary',
	...defineAppRouteOptions({
		reloadOn: 'never',
		// Make sure the children know if we're logged in or not.
		resolver: () => touchUser(),
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<router-view />
</template>
