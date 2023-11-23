<script lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import AppNavTabList from '../../../../../../../../_common/nav/tab-list/AppNavTabList.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../_common/route/route-component';
import { Timezone } from '../../../../../../../../_common/timezone/timezone.service';
import AppCommunitiesViewPageContainer from '../../../../_page-container/page-container.vue';
import AppCommunitiesEditCompetitionNav from './_nav/nav.vue';

export default {
	...defineAppRouteOptions({
		// A lot of components and displays in the child routes need timezone info, so just fetch it here.
		resolver: () => Timezone.getTimezones(),
	}),
	components: { AppNavTabList },
};

createAppRoute({
	routeTitle: computed(() => ``),
});
</script>

<template>
	<AppCommunitiesViewPageContainer full>
		<AppNavTabList>
			<AppCommunitiesEditCompetitionNav />
		</AppNavTabList>

		<div class="row">
			<div class="col-md-8">
				<RouterView />
			</div>
		</div>
	</AppCommunitiesViewPageContainer>
</template>
