<script lang="ts">
import { RouterView } from 'vue-router';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { touchUser } from '../../../_common/user/user.model';

export default {
	...defineAppRouteOptions({
		deps: {},
		// Just make sure the user is loaded in.
		resolver: () => touchUser(),
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<RouterView />
</template>
