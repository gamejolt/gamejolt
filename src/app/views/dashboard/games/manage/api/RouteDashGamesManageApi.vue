<script lang="ts">
import { RouterView } from 'vue-router';
import AppNavTabList from '../../../../../../_common/nav/tab-list/AppNavTabList.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppManageGameApiNav from './AppManageGameApiNav.vue';
export default {
	...defineAppRouteOptions({
		reloadOn: 'always',
	}),
};
</script>

<script lang="ts" setup>
createAppRoute({});
</script>

<template>
	<div>
		<div v-if="Screen.isMobile" class="container">
			<br />
			<AppNavTabList>
				<AppManageGameApiNav />
			</AppNavTabList>
		</div>

		<section class="section">
			<div class="container">
				<div class="row">
					<div v-if="Screen.isDesktop" class="col-md-2">
						<nav class="platform-list">
							<AppManageGameApiNav />
						</nav>
					</div>
					<div class="col-xs-12 col-md-10">
						<RouterView />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
