<script lang="ts">
import { computed, ref, toRef } from 'vue';
import { RouteLocationNormalized, useRoute } from 'vue-router';

import AppFollowerList from '~app/components/follower/list/AppFollowerList.vue';
import AppShellPageBackdrop from '~app/components/shell/AppShellPageBackdrop.vue';
import { useGameRouteController } from '~app/views/discover/games/view/RouteDiscoverGamesView.vue';
import { Api } from '~common/api/api.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { UserModel } from '~common/user/user.model';

function getFetchUrl(route: RouteLocationNormalized) {
	return `/web/discover/games/followers/${route.params.id}`;
}
export default {
	...defineAppRouteOptions({
		cache: true,
		lazy: true,
		reloadOn: 'never',
		resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const { game } = useGameRouteController()!;

const users = ref<UserModel[]>([]);

const loadUrl = toRef(() => getFetchUrl(route));

createAppRoute({
	routeTitle: computed(() => (game.value ? `People following ${game.value.title}` : null)),
	onResolved({ payload }) {
		users.value = UserModel.populate(payload.users);
	},
});
</script>

<template>
	<AppShellPageBackdrop>
		<section class="section">
			<div class="gj-container">
				<div v-if="!game?.follower_count" class="alert alert-info">
					{{ $gettext(`No one is following this game yet.`) }}
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
