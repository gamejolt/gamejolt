<script lang="ts">
import { computed } from 'vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: computed(() => $gettext('Advertising Platforms')),
});
</script>

<template>
	<!--TODO(component-setup-refactor-routes-4): usage of v-html-->
	<div v-html="html"></div>
</template>
