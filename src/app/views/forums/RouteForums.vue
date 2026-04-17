<script lang="ts">
import '~app/views/forums/forums-content.styl';

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
	<RouterView class="route-forums" />
</template>
