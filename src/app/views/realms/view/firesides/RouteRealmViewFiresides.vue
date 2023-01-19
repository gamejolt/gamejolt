<script lang="ts">
import { computed, ref } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppFiresideAvatar from '../../../../components/fireside/avatar/AppFiresideAvatar.vue';
import AppFiresideAvatarBase from '../../../../components/fireside/avatar/AppFiresideAvatarBase.vue';
import { illNoComments } from '../../../../img/ill/illustrations';
import { useRealmRouteStore } from '../view.store';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: {
			params: ['path'],
		},
		resolver: ({ route }) => Api.sendRequest(`/web/realms/firesides/${route.params.path}`),
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useRealmRouteStore();
const firesides = ref<Fireside[]>([]);

const gridColumns = computed(() => {
	if (Screen.isXs) {
		return 4;
	} else if (Screen.isSm) {
		return 5;
	}

	return 6;
});

const placeholderCount = computed(() => {
	// 2 rows for all breakpoints
	return gridColumns.value * 2;
});

const appRoute = createAppRoute({
	routeTitle: computed(() =>
		routeStore.realm.value ? `Firesides in the ${routeStore.realm.value.name} Realm` : null
	),
	onResolved: ({ payload }) => {
		firesides.value = Fireside.populate(payload.firesides);
	},
});
</script>

<template>
	<div>
		<h1 class="section-header" :class="{ 'h2 -text-overflow': Screen.isMobile }">
			<AppTranslate>Active Firesides</AppTranslate>
			<small v-if="Screen.isDesktop">in {{ routeStore.realm.value.name }}</small>
		</h1>
		<br />

		<AppIllustration
			v-if="appRoute.isBootstrapped && firesides.length === 0"
			:asset="illNoComments"
		>
			<p>
				<AppTranslate>There are no active firesides in this realm yet.</AppTranslate>
			</p>
		</AppIllustration>
		<div
			v-else
			:style="{
				display: 'grid',
				gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
				gridGap: '16px',
			}"
		>
			<template v-if="!firesides.length">
				<AppFiresideAvatarBase
					v-for="i of placeholderCount"
					:key="`placeholder-${i}`"
					:is-placeholder="true"
				/>
			</template>
			<template v-else>
				<AppFiresideAvatar
					v-for="fireside of firesides"
					:key="fireside.id"
					:fireside="fireside"
					hide-realm
				/>
			</template>
		</div>
	</div>
</template>
