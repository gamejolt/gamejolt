<script lang="ts">
import { RouterView } from 'vue-router';

import AppCommunityPageContainer from '~app/views/communities/view/_page-container/AppCommunityPageContainer.vue';
import AppCompetitionNav from '~app/views/communities/view/edit/channels/edit/competition/_nav/AppCompetitionNav.vue';
import AppNavTabList from '~common/nav/tab-list/AppNavTabList.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { Timezone } from '~common/timezone/timezone.service';

export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
		// A lot of components and displays in the child routes need timezone
		// info, so just fetch it here.
		resolver: () => Timezone.getTimezones(),
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<AppCommunityPageContainer full>
		<AppNavTabList>
			<AppCompetitionNav />
		</AppNavTabList>

		<div class="row">
			<div class="col-md-8">
				<RouterView />
			</div>
		</div>
	</AppCommunityPageContainer>
</template>
