<script lang="ts">
import { computed } from 'vue';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';

import { html } from '../../../../lib/terms/safety/global.md';

const template = html;

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: computed(() => $gettext('Game Jolt Child Safety and Anti-Exploitation Standards')),
});
</script>

<template>
	<div>
		<!-- eslint-disable-next-line vue/no-v-html -->
		<div v-html="template" />
	</div>
</template>
