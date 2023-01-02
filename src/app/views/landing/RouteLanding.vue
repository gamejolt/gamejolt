<script lang="ts">
import { RouterView } from 'vue-router';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import { User } from '../../../_common/user/user.model';

export default {
	...defineAppRouteOptions({
		deps: {},
		// Just make sure the user is loaded in.
		resolver: () => User.touch(),
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<RouterView />
</template>
