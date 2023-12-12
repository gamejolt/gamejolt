<script>
import { computed, ref } from 'vue';
import { ViteMarkdownExport } from '../../../../../typings/markdown';
import { buildPayloadErrorForStatusCode } from '../../../../_common/payload/payload-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';

const paths = import.meta.glob<ViteMarkdownExport>('../../../../lib/doc-game-api/v1.x/**/*.md');

export default {
		...defineAppRouteOptions({
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
	<!--TODO(component-setup-refactor-routes-4): revisit this-->
	<div>
		{{ content }}
	</div>
</template>
