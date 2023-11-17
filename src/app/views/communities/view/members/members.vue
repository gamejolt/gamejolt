<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { UserModel } from '../../../../../_common/user/user.model';
import AppFollowerList from '../../../../components/follower/list/list.vue';
import AppCommunitiesViewPageContainer from '../_page-container/page-container.vue';
import { useCommunityRouteStore } from '../view.store';

function getFetchUrl(route: RouteLocationNormalized) {
	return `/web/communities/members/${route.params.path}`;
}

@Options({
	name: 'RouteCommunitiesViewMembers',
	components: {
		AppFollowerList,
		AppCommunitiesViewPageContainer,
	},
})
@OptionsForLegacyRoute({
	cache: true,
	lazy: true,
	deps: {
		params: ['path'],
	},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteCommunitiesViewMembers extends LegacyRouteComponent {
	routeStore = setup(() => useCommunityRouteStore())!;

	users: UserModel[] = [];

	get community() {
		return this.routeStore.community;
	}

	get routeTitle() {
		return this.community ? `Members of the ${this.community.name} Community` : null;
	}

	get loadUrl() {
		return getFetchUrl(this.$route);
	}

	routeResolved($payload: any) {
		this.users = UserModel.populate($payload.users);
	}
}
</script>

<template>
	<AppCommunitiesViewPageContainer full>
		<div v-if="!community.member_count" class="alert alert-info">
			<AppTranslate>
				No one is a member of this community yet. Maybe you could be the first!
			</AppTranslate>
		</div>
		<AppFollowerList
			v-else
			:url="loadUrl"
			:initial-users="users"
			:count="community.member_count || 0"
		/>
	</AppCommunitiesViewPageContainer>
</template>
