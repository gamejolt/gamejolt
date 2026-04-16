<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { RouteLocationNormalized, useRoute } from 'vue-router';

import AppFollowerList from '~app/components/follower/list/AppFollowerList.vue';
import AppCommunityPageContainer from '~app/views/communities/view/_page-container/AppCommunityPageContainer.vue';
import { useCommunityRouteStore } from '~app/views/communities/view/view.store';
import { Api } from '~common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '~common/route/route-component';
import { UserModel } from '~common/user/user.model';

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
const routeStore = useCommunityRouteStore()!;
const route = useRoute();

const users = ref<UserModel[]>([]);

const community = toRef(() => routeStore.community);
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
	<AppCommunityPageContainer full>
		<div v-if="!community.member_count" class="alert alert-info">
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
	</AppCommunityPageContainer>
</template>
