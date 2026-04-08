<script lang="ts">
import { Api } from '../../../../../_common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';

export default {
	name: 'RouteProfileTrophiesAll',
	...defineAppRouteOptions({
		reloadOn: 'always',
		resolver: ({ route }) => Api.sendRequest('/web/profile/trophies/all/@' + route.params.username),
	}),
};
</script>

<script lang="ts" setup>
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { computed, ref } from 'vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppTrophyListPaged from '../../../../../_common/trophy/list/AppTrophyListPaged.vue';
import { populateTrophies } from '../../../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophyModel } from '../../../../../_common/user/trophy/user-base-trophy.model';
import { useProfileRouteStore } from '../../RouteProfile.vue';

const { user } = useProfileRouteStore()!;

const trophies = ref<UserBaseTrophyModel[]>([]);

const hasTrophies = computed(() => trophies.value.length > 0);

const listLoadMoreUrl = computed(
	() => `/web/profile/trophies/all/@${user.value!.username}`
);

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
