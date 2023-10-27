<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../../../../_common/route/legacy-route-component';
import FormCommunityCompetitionEdit from '../../../../../../../../components/forms/community/competition/edit/edit.vue';
import { useCommunityRouteStore } from '../../../../../view.store';

@Options({
	name: 'RouteCommunitiesViewEditChannelsCompetitionSettings',
	components: {
		FormCommunityCompetitionEdit,
	},
})
@OptionsForLegacyRoute()
export default class RouteCommunitiesViewEditChannelsCompetitionSettings extends LegacyRouteComponent {
	routeStore = setup(() => useCommunityRouteStore())!;

	get competition() {
		return this.routeStore.competition!;
	}
}
</script>

<template>
	<FormCommunityCompetitionEdit :model="competition" />
</template>
