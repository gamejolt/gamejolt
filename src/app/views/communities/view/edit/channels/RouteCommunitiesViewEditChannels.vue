<script lang="ts">
import { RouterView } from 'vue-router';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<RouterView />
</template>
