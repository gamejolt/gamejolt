<script lang="ts">
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { ModelClassType } from '../../../../../_common/model/model.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { $gettextInterpolate } from '../../../../../_common/translate/translate.service';
import AppFiresideAvatar from '../../../../components/fireside/avatar/AppFiresideAvatar.vue';
import AppFiresideAvatarBase from '../../../../components/fireside/avatar/AppFiresideAvatarBase.vue';
import { illNoComments } from '../../../../img/ill/illustrations';
import { RealmRoutePayload, useRealmRouteStore } from '../view.store';

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		deps: {
			params: ['path'],
		},
		resolver: ({ route }) =>
			Promise.all([
				Api.sendRequest('/web/realms/' + route.params.path),
				Api.sendRequest(`/web/realms/firesides/${route.params.path}`),
			]),
	}),
};
</script>

<script lang="ts" setup>
const { realm, processPayload } = useRealmRouteStore();
const firesides = ref<Fireside[]>([]);

const gridColumns = computed(() => {
	if (Screen.isXs) {
		return 4;
	} else if (Screen.isSm) {
		return 5;
	}

	return 6;
});

// 2 rows for all breakpoints
const placeholderCount = computed(() => gridColumns.value * 2);

type RealmFiresidesPayload = {
	firesides: ModelClassType<Fireside>[];
};

const { isBootstrapped } = createAppRoute({
	routeTitle: computed(() =>
		realm.value
			? $gettextInterpolate(`Firesides in the %{ realm } Realm`, { realm: realm.value.name })
			: null
	),
	onResolved: (resolved: { payload: [RealmRoutePayload, RealmFiresidesPayload] }) => {
		const [realmPayload, firesidePayload] = resolved.payload;
		processPayload(realmPayload);

		firesides.value = Fireside.populate(firesidePayload.firesides);
	},
});
</script>

<template>
	<div>
		<h1 class="section-header" :class="{ 'h2 -text-overflow': Screen.isMobile }">
			{{ $gettext(`Active Firesides`) }}
			{{ ' ' }}
			<small v-if="Screen.isDesktop">
				{{ $gettext(`in`) }}
				{{ ' ' }}
				<RouterLink :to="realm.routeLocation">
					{{ realm.name }}
				</RouterLink>
			</small>
		</h1>
		<br />

		<AppIllustration v-if="isBootstrapped && firesides.length === 0" :asset="illNoComments">
			<p>
				{{ $gettext(`There are no active firesides in this realm yet.`) }}
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
					is-placeholder
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
