<script lang="ts">
import { useRoute } from 'vue-router';

import { Api } from '~common/api/api.service';
import { defineAppRouteOptions } from '~common/route/route-component';
import { createAppRoute } from '~common/route/route-component';
import { useSiteEditorStore } from '~site-editor/store/index';

export default {
	...defineAppRouteOptions({
		lazy: false,
		cache: false,
		reloadOn: 'always',
		resolver: ({ route }) => {
			const siteId = parseInt(route.query.id as string, 10);
			return Api.sendRequest(`/web/dash/sites/editor/${siteId}`);
		},
	}),
};
</script>

<script lang="ts" setup>
const store = useSiteEditorStore();
const route = useRoute();

createAppRoute({
	onResolved({ payload }) {
		store.bootstrapTab(route.params.tab as any, payload);
	},
});
</script>

<template>
	<div />
</template>
