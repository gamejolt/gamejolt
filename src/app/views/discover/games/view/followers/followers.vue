<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { User } from '../../../../../../_common/user/user.model';
import AppFollowerList from '../../../../../components/follower/list/list.vue';
import { useGameRouteController } from '../view.vue';

function getFetchUrl(route: RouteLocationNormalized) {
	return `/web/discover/games/followers/${route.params.id}`;
}

@Options({
	name: 'RouteProfileFollowers',
	components: {
		AppFollowerList,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteProfileFollowers extends BaseRouteComponent {
	routeStore = setup(() => useGameRouteController()!);

	users: User[] = [];

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
		this.users = User.populate($payload.users);
	}
}
</script>

<template>
	<section class="section fill-backdrop">
		<div class="container">
			<div v-if="!game?.follower_count" class="alert alert-info">
				<translate>No one is following this game yet.</translate>
			</div>
			<app-follower-list
				v-else
				:url="loadUrl"
				:initial-users="users"
				:count="game.follower_count || 0"
			/>
		</div>
	</section>
</template>
