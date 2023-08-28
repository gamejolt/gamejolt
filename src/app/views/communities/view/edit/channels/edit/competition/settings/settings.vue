<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../../_common/route/legacy-route-component';
import FormCommunityCompetitionEdit from '../../../../../../../../components/forms/community/competition/edit/edit.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../../view.store';

@Options({
	name: 'RouteCommunitiesViewEditChannelsCompetitionSettings',
	components: {
		FormCommunityCompetitionEdit,
	},
})
@OptionsForLegacyRoute()
export default class RouteCommunitiesViewEditChannelsCompetitionSettings extends LegacyRouteComponent {
	@Inject({ from: CommunityRouteStoreKey })
	routeStore!: CommunityRouteStore;

	get competition() {
		return this.routeStore.competition!;
	}
}
</script>

<template>
	<FormCommunityCompetitionEdit :model="competition" />
</template>
