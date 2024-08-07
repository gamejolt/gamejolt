<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import { Meta } from '../../../../_common/meta/meta-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { kThemeFgMuted } from '../../../../_common/theme/variables';
import { $gettext } from '../../../../_common/translate/translate.service';
import { HelpPageModel } from '../../../components/help/page/page.model';

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
