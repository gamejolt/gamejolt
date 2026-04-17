<script lang="ts">
import { computed } from 'vue';

import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { $gettext } from '~common/translate/translate.service';
import { html } from '~lib/terms/ads/global.md';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: computed(() => $gettext('Advertising Platforms')),
});
</script>

<template>
	<!-- eslint-disable-next-line vue/no-v-html -->
	<div v-html="html" />
</template>
