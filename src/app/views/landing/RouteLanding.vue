<script lang="ts">
import { RouterView } from 'vue-router';

import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { touchUser } from '~common/user/user.model';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
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
