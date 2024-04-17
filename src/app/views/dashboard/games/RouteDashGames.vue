<script lang="ts">
import { RouterView } from 'vue-router';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';

export default {
	...defineAppRouteOptions({
		// We are going to always reload all routes in the chain when managing
		// games so that if the game is updated by a collaborator or in another
		// tab, the game info will reload.
		reloadOn: 'always',
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<RouterView />
</template>
