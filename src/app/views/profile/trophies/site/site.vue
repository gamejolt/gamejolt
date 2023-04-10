<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { BaseRouteComponent, OptionsForRoute } from '../../../../../_common/route/route-component';
import { populateTrophies } from '../../../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophy } from '../../../../../_common/user/trophy/user-base-trophy.model';
import AppTrophyCard from '../../../../components/trophy/card/card.vue';
import AppTrophyListPaged from '../../../../components/trophy/list/paged/paged.vue';
import { useProfileRouteController } from '../../RouteProfile.vue';

@Options({
	name: 'RouteProfileTrophiesSite',
	components: {
		AppTrophyCard,
		AppTrophyListPaged,
	},
})
@OptionsForRoute({
	deps: {},
	resolver: ({ route }) =>
		Api.sendRequest('/web/profile/trophies/site/@' + route.params.username),
})
export default class RouteProfileTrophiesSite extends BaseRouteComponent {
	routeStore = setup(() => useProfileRouteController()!);

	trophies: UserBaseTrophy[] = [];

	get user() {
		return this.routeStore.user;
	}

	get routeTitle() {
		if (this.user) {
			return this.$gettextInterpolate(`@%{ user }'s achieved Game Jolt Trophies`, {
				user: this.user.username,
			});
		}
		return null;
	}

	get hasTrophies() {
		return this.trophies.length > 0;
	}

	get listLoadMoreUrl() {
		return `/web/profile/trophies/site/@${this.user!.username}`;
	}

	routeResolved(payload: any) {
		if (payload.trophies) {
			const trophies = populateTrophies(payload.trophies);
			this.trophies.push(...trophies);
		}
	}
}
</script>

<template>
	<div>
		<div v-if="!hasTrophies" class="alert alert-info">
			<span>
				<AppTranslate
					>This user has not achieved any Game Jolt trophies...yet.</AppTranslate
				>
			</span>
		</div>

		<AppTrophyListPaged v-else :initial-trophies="trophies" :url="listLoadMoreUrl" />
	</div>
</template>
