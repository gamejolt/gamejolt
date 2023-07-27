<script lang="ts">
import { Options } from 'vue-property-decorator';
import AppNavTabList from '../../../../../../_common/nav/tab-list/tab-list.vue';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import AppManageGameApiNav from './AppManageGameApiNav.vue';

@Options({
	name: 'RouteDashGamesManageApi',
	components: {
		AppManageGameApiNav,
		AppNavTabList,
	},
})
@OptionsForLegacyRoute()
export default class RouteDashGamesManageApi extends LegacyRouteComponent {
	readonly Screen = Screen;
}
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
						<router-view />
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
