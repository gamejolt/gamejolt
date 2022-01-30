<script lang="ts">
import { Inject, Options } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../../../../_common/route/route-component';
import FormCommunityCompetitionEdit from '../../../../../../../../components/forms/community/competition/edit/edit.vue';
import { CommunityRouteStore, CommunityRouteStoreKey } from '../../../../../view.store';

@Options({
	name: 'RouteCommunitiesViewEditChannelsCompetitionSettings',
	components: {
		FormCommunityCompetitionEdit,
	},
})
@OptionsForRoute()
export default class RouteCommunitiesViewEditChannelsCompetitionSettings extends BaseRouteComponent {
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
