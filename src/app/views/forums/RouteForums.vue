<script lang="ts">
import { RouterView } from 'vue-router';
import { createAppRoute, defineAppRouteOptions } from '../../../_common/route/route-component';
import './forums-content.styl';

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
	<RouterView class="route-forums" />
</template>
