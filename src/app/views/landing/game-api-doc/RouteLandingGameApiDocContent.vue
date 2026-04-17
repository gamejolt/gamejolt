<script lang="ts">
import { computed, ref } from 'vue';

import { buildPayloadErrorForStatusCode } from '~common/payload/payload-service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { $gettext } from '~common/translate/translate.service';
import { ViteMarkdownExport } from '~typings/markdown';

const paths = import.meta.glob<ViteMarkdownExport>('../../../../lib/doc-game-api/v1.x/**/*.md');

export default {
	...defineAppRouteOptions({
		reloadOn: 'always',
		async resolver({ route }) {
			console.log(route.params.path);
			// First check the path as is, then check with "index".
			let path = ((route.params.path || []) as string[]).join('/');
			if (!path) {
				path = 'index';
			}

			console.log(paths);

			if (paths[`../../../../lib/doc-game-api/v1.x/${path}.md`]) {
				return (await paths[`../../../../lib/doc-game-api/v1.x/${path}.md`]()).html;
			} else if (paths[`../../../../lib/doc-game-api/v1.x/${path}/index.md`]) {
				return (await paths[`../../../../lib/doc-game-api/v1.x/${path}/index.md`]()).html;
			}

			return buildPayloadErrorForStatusCode(404);
		},
	}),
};
</script>

<script lang="ts" setup>
const content = ref('');

createAppRoute({
	routeTitle: computed(() => {
		let title = $gettext(`Game API Documentation`);

		// We try to pull the first h1 for the title of the page.
		const matches = content.value.match(/<h1([^>]*)>(.*?)<\/h1>/);
		if (matches) {
			title = `${matches[2]} - ${title}`;
		}

		return title;
	}),
	onResolved({ payload }) {
		content.value = payload;
	},
});
</script>

<template>
	<!-- eslint-disable-next-line vue/no-v-html -->
	<div v-html="content" />
</template>
