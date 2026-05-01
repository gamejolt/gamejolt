<script lang="ts">
import { RouterView } from 'vue-router';

import AppManageGameApiNav from '~app/views/dashboard/games/manage/api/AppManageGameApiNav.vue';
import AppNavTabList from '~common/nav/tab-list/AppNavTabList.vue';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { getScreen } from '~common/screen/screen-service';
export default {
	...defineAppRouteOptions({
		reloadOn: 'never',
	}),
};
</script>

<script lang="ts" setup>
const { isMobile, isDesktop } = getScreen();

createAppRoute({});
</script>

<template>
	<div>
		<div v-if="isMobile" class="container">
			<br />
			<AppNavTabList>
				<AppManageGameApiNav />
			</AppNavTabList>
		</div>

		<section class="section">
			<div class="container">
				<div class="row">
					<div v-if="isDesktop" class="col-md-2">
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
