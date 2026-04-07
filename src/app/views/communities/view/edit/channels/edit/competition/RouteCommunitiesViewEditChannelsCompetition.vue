<script lang="ts">
import { RouterView } from 'vue-router';
import AppNavTabList from '../../../../../../../../_common/nav/tab-list/AppNavTabList.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../../../_common/route/route-component';
import { Timezone } from '../../../../../../../../_common/timezone/timezone.service';
import AppCommunityPageContainer from '../../../../_page-container/AppCommunityPageContainer.vue';
import AppCompetitionNav from './_nav/AppCompetitionNav.vue';

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
