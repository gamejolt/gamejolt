<script lang="ts">
import { touchUser } from '../../../_common/user/user.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../_common/route/route-component';

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
