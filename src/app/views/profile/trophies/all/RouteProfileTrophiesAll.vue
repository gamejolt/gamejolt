<script lang="ts">
import { computed, ref } from 'vue';

import { useProfileRouteStore } from '~app/views/profile/RouteProfile.vue';
import { Api } from '~common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '~common/route/route-component';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';
import AppTrophyListPaged from '~common/trophy/list/AppTrophyListPaged.vue';
import { populateTrophies } from '~common/user/trophy/trophy-utils';
import { UserBaseTrophyModel } from '~common/user/trophy/user-base-trophy.model';

export default {
	name: 'RouteProfileTrophiesAll',
	...defineAppRouteOptions({
		reloadOn: 'always',
		resolver: ({ route }) =>
			Api.sendRequest('/web/profile/trophies/all/@' + route.params.username),
	}),
};
</script>

<script lang="ts" setup>
const { user } = useProfileRouteStore()!;

const trophies = ref<UserBaseTrophyModel[]>([]);

const hasTrophies = computed(() => trophies.value.length > 0);

const listLoadMoreUrl = computed(() => `/web/profile/trophies/all/@${user.value!.username}`);

createAppRoute({
	routeTitle: computed(() => {
		if (user.value) {
			return $gettext(`@%{ user }'s achieved Trophies`, {
				user: user.value.username,
			});
		}
		return null;
	}),
	onResolved({ payload }) {
		if (payload.trophies) {
			const newTrophies = populateTrophies(payload.trophies);
			trophies.value.push(...newTrophies);
		}
	},
});
</script>

<template>
	<div>
		<div v-if="!hasTrophies" class="alert alert-info">
			<span>
				<AppTranslate>This user has not achieved any trophies...yet.</AppTranslate>
			</span>
		</div>

		<AppTrophyListPaged v-else :initial-trophies="trophies" :url="listLoadMoreUrl" />
	</div>
</template>
