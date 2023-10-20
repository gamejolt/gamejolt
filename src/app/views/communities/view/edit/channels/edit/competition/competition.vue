<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import { formatNumber } from '../../../../../../../../_common/filters/number';
import AppNavTabList from '../../../../../../../../_common/nav/tab-list/AppNavTabList.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../../../../../_common/screen/screen-service';
import { Timezone } from '../../../../../../../../_common/timezone/timezone.service';
import AppCommunitiesViewPageContainer from '../../../../_page-container/page-container.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../view.store';
import AppCommunitiesEditCompetitionNav from './_nav/nav.vue';

@Options({
	name: 'RouteCommunitiesViewEditChannelsCompetition',
	components: {
		AppCommunitiesViewPageContainer,
		AppNavTabList,
		AppCommunitiesEditCompetitionNav,
	},
})
@OptionsForLegacyRoute({
	// A lot of components and displays in the child routes need timezone info, so just fetch it here.
	resolver: () => Timezone.getTimezones(),
})
export default class RouteCommunitiesViewEditChannelsCompetition extends LegacyRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	readonly Screen = Screen;
	readonly formatNumber = formatNumber;

	get channel() {
		return this.routeStore.channel!;
	}

	get competition() {
		return this.routeStore.competition!;
	}
}
</script>

<template>
	<AppCommunitiesViewPageContainer full>
		<AppNavTabList>
			<AppCommunitiesEditCompetitionNav />
		</AppNavTabList>

		<div class="row">
			<div class="col-md-8">
				<router-view />
			</div>
		</div>
	</AppCommunitiesViewPageContainer>
</template>
