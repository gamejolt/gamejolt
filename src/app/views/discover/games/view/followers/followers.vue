<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';
import { UserModel } from '../../../../../../_common/user/user.model';
import AppFollowerList from '../../../../../components/follower/list/AppFollowerList.vue';
import AppShellPageBackdrop from '../../../../../components/shell/AppShellPageBackdrop.vue';
import { useGameRouteController } from '../view.vue';

function getFetchUrl(route: RouteLocationNormalized) {
	return `/web/discover/games/followers/${route.params.id}`;
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
	routeStore = setup(() => useGameRouteController()!);

	users: UserModel[] = [];

	get routeTitle() {
		return this.game ? `People following ${this.game.title}` : null;
	}

	get game() {
		return this.routeStore.game;
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
	<AppShellPageBackdrop>
		<section class="section">
			<div class="container">
				<div v-if="!game?.follower_count" class="alert alert-info">
					<AppTranslate>No one is following this game yet.</AppTranslate>
				</div>
				<AppFollowerList
					v-else
					:url="loadUrl"
					:initial-users="users"
					:count="game.follower_count || 0"
				/>
			</div>
		</section>
	</AppShellPageBackdrop>
</template>
