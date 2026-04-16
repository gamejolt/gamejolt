<script lang="ts">
import { computed, ref } from 'vue';

import { HelpPageModel } from '~app/components/help/page/page.model';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import AppContentViewer from '~common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '~common/environment/environment.service';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { Meta } from '~common/meta/meta-service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import AppShareCard from '~common/share/card/AppShareCard.vue';
import { useCommonStore } from '~common/store/common-store';
import { kThemeFgMuted } from '~common/theme/variables';
import { $gettext } from '~common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: false,
		reloadOn: { params: ['category', 'page'] },
		resolver: ({ route }) =>
			Api.sendRequest(`/web/help/page/${route.params.category}/${route.params.page}`),
	}),
};
</script>

<script lang="ts" setup>
const page = ref<HelpPageModel>();

const { user } = useCommonStore();

const routeTitle = computed(() => page.value?.title || $gettext(`Help Docs`));

createAppRoute({
	routeTitle,
	onResolved({ payload }) {
		page.value = new HelpPageModel(payload.page);

		if (payload.meta) {
			const meta = payload.meta;

			Meta.description = meta.description;
			Meta.fb = payload.fb || {};
			Meta.fb.title = routeTitle.value;
			Meta.twitter = payload.twitter || {};
			Meta.twitter.title = routeTitle.value;
		}
	},
});

const canModerate = computed(() => user.value && user.value.permission_level > 3);
</script>

<template>
	<div v-if="page" :key="page.id">
		<h2 class="sans-margin-top anim-fade-in">
			{{ page?.title }}
			<a
				v-if="canModerate"
				:href="`${Environment.baseUrl}/moderate/help/page/${page.id}`"
				target="_blank"
				:style="{ color: kThemeFgMuted }"
			>
				<AppJolticon icon="cog" />
			</a>
		</h2>
		<div class="anim-fade-in">
			<div v-if="canModerate">
				<p>
					<a
						:href="`${Environment.baseUrl}/z/content/help-page/${page.id}`"
						target="_blank"
					>
						<AppButton icon="edit">
							{{ $gettext(`Edit`) }}
						</AppButton>
					</a>
				</p>
			</div>
			<AppContentViewer :source="page.content" />
		</div>
		<hr />
		<div :style="{ maxWidth: `400px` }">
			<AppShareCard resource="help-page" :url="page.getShareUrl()" offset-color />
		</div>
	</div>
</template>
