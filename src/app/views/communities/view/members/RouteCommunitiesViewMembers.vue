<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { RouteLocationNormalized, useRoute } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { UserModel } from '../../../../../_common/user/user.model';
import AppFollowerList from '../../../../components/follower/list/AppFollowerList.vue';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';
import { useCommunityRouteStore } from '../view.store';

function getFetchUrl(route: RouteLocationNormalized) {
	return `/web/communities/members/${route.params.path}`;
}

export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		reloadOn: {
			params: ['path'],
		},
		resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
	}),
};
</script>

<script lang="ts" setup>
const { community } = useCommunityRouteStore()!;
const route = useRoute();

const users = ref<UserModel[]>([]);

const loadUrl = toRef(() => getFetchUrl(route));

createAppRoute({
	routeTitle: computed(() =>
		community.value ? `Members of the ${community.value.name} Community` : null
	),
	onResolved({ payload }) {
		users.value = UserModel.populate(payload.users);
	},
});
</script>

<template>
	<AppCommunitiesViewPageContainer full>
		<div v-if="!community?.member_count" class="alert alert-info">
			{{
				$gettext(`No one is a member of this community yet. Maybe you could be the first!`)
			}}
		</div>
		<AppFollowerList
			v-else
			:url="loadUrl"
			:initial-users="users"
			:count="community.member_count || 0"
		/>
	</AppCommunitiesViewPageContainer>
</template>
