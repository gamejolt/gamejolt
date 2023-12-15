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
	return `/web/profile/followers/@${route.params.username}`;
}

@Options({
	name: 'RouteProfileFollowers',
	components: {
		AppFollowerList,
		AppShellPageBackdrop,
	},
})
@OptionsForLegacyRoute({
	cache: true,
	lazy: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteProfileFollowers extends LegacyRouteComponent {
	routeStore = setup(() => useProfileRouteStore()!);

	users: UserModel[] = [];

	get user() {
		return this.routeStore.user;
	}

	get routeTitle() {
		return this.user
			? `People following ${this.user.display_name} (@${this.user.username})`
			: null;
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
				<div v-if="!user?.follower_count" class="alert alert-info">
					<AppTranslate>No one is following this person yet.</AppTranslate>
				</div>
				<AppFollowerList
					v-else
					:url="loadUrl"
					:initial-users="users"
					:count="user.follower_count || 0"
				/>
			</div>
		</section>
	</AppShellPageBackdrop>
</template>
