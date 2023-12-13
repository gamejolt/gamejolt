<script lang="ts">
import { computed } from 'vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
// TODO(component-setup-refactor-routes-4): html not available in this import?
import { html } from '../../../../lib/terms/deletion/global.md';

export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: computed(() => $gettext('Account Deletion')),
});
</script>

<template>
	<div v-html="html"></div>
</template>
