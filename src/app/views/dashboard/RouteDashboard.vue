<script lang="ts">
import { RouterView } from 'vue-router';

import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { useCommonStore } from '~common/store/common-store';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
const { user } = useCommonStore();

createAppRoute({});
</script>

<template>
	<div v-if="user">
		<RouterView />
	</div>
</template>
