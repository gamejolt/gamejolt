<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../_common/api/api.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import { UserModel } from '../../../../_common/user/user.model';
import AppFollowerList from '../../../components/follower/list/AppFollowerList.vue';
import AppShellPageBackdrop from '../../../components/shell/AppShellPageBackdrop.vue';
import { useProfileRouteStore } from '../RouteProfile.vue';

function getFetchUrl(route: RouteLocationNormalized) {
	return `/web/profile/following/@${route.params.username}`;
}

@Options({
	name: 'RouteProfileFollowing',
	components: {
		AppFollowerList,
		AppShellPageBackdrop,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteProfileFollowing extends LegacyRouteComponent {
	routeStore = setup(() => useProfileRouteStore()!);

	users: UserModel[] = [];

	get routeTitle() {
		return this.user
			? `People followed by ${this.user.display_name} (@${this.user.username})`
			: null;
	}

	get user() {
		return this.routeStore.user;
	}

	get loadUrl() {
		return getFetchUrl(this.$route);
	}

	routeResolved(payload: any) {
		this.users = UserModel.populate(payload.users);
	}
}
</script>

<template>
	<AppShellPageBackdrop>
		<section class="section">
			<div class="container">
				<div v-if="!user?.following_count" class="alert alert-info">
					<AppTranslate>This person isn't following anyone yet.</AppTranslate>
				</div>
				<AppFollowerList
					v-else
					:url="loadUrl"
					:initial-users="users"
					:count="user.following_count || 0"
				/>
			</div>
		</section>
	</AppShellPageBackdrop>
</template>
