<script lang="ts">
import { computed } from 'vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
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
	<div v-html="html" />
</template>
