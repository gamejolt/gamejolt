<script lang="ts">
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import AppContentViewer from '../../../../_common/content/content-viewer/AppContentViewer.vue';
import { Environment } from '../../../../_common/environment/environment.service';
import { Meta } from '../../../../_common/meta/meta-service';
import { createAppRoute, defineAppRouteOptions } from '../../../../_common/route/route-component';
import AppShareCard from '../../../../_common/share/card/AppShareCard.vue';
import { useCommonStore } from '../../../../_common/store/common-store';
import { $gettext } from '../../../../_common/translate/translate.service';
import HelpPage, { $viewPage } from '../../../components/help/page/page.model';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: false,
		deps: { params: ['category', 'page'] },
		resolver: ({ route }) =>
			Api.sendRequest(`/web/help/page/${route.params.category}/${route.params.page}`),
	}),
	components: { AppShareCard },
};
</script>

<script lang="ts" setup>
const page = ref<HelpPage>();

const { user } = useCommonStore();

const routeTitle = computed(() => page.value?.title || $gettext(`Help Docs`));

createAppRoute({
	routeTitle,
	onResolved({ payload }) {
		page.value = new HelpPage(payload.page);

		$viewPage(page.value);

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
		<h2 class="sans-margin-top _page-header anim-fade-in">
			{{ page?.title }}
			<a
				v-if="canModerate"
				:href="`${Environment.baseUrl}/moderate/help/page/${page.id}`"
				target="_blank"
				:style="{ color: 'var(--theme-fg-muted)' }"
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
		<div>
			<AppShareCard
				class="_share-card"
				resource="help-page"
				:url="page.getShareUrl()"
				offset-color
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
h2._page-header
	font-size: 32px
	margin-bottom: 40px

._share-card
	margin-top: 24px
	max-width: 360px
</style>
