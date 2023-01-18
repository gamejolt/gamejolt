<script lang="ts">
import { computed } from '@vue/reactivity';
import { RouteLocationRedirect } from '../../../../utils/router';
import { Api } from '../../../../_common/api/api.service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import { $gettext } from '../../../../_common/translate/translate.service';
import { routeLandingHelpIndex, routeLandingHelpPage } from './help.route';

export default {
	...defineAppRouteOptions({
		cache: false,
		lazy: false,
		deps: { params: ['path'] },
		async resolver({ route }) {
			// Fetch redirect target.
			const payload = await Api.sendRequest(`/web/help/redirect/${route.params.path}`);

			// If the redirect path is not known, redirect to index.
			if (!payload || !payload.redirect) {
				return new RouteLocationRedirect({
					name: routeLandingHelpIndex.name,
				});
			}

			return new RouteLocationRedirect({
				name: routeLandingHelpPage.name,
				params: {
					category: payload.redirect.category,
					page: payload.redirect.page,
				},
			});
		},
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({
	routeTitle: computed(() => $gettext(`Help Docs`)),
});
</script>
