<script lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import AppExpand from '../../../../../../_common/expand/AppExpand.vue';
import AppMediaItemCover from '../../../../../../_common/media-item/cover/AppMediaItemCover.vue';
import AppNavTabList from '../../../../../../_common/nav/tab-list/AppNavTabList.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { showGameHeaderModal } from '../../../../../components/game/header-modal/header-modal.service';
import { useGameDashRouteController } from '../manage.store';
import AppManageGameMediaBar from './_media-bar/media-bar.vue';
import AppManageGameNav from './_nav/nav.vue';
export default {
	...defineAppRouteOptions({}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const { game, media } = useGameDashRouteController()!;

function showEditHeader() {
	showGameHeaderModal(game.value!);
}

createAppRoute({
	routeTitle: computed(() => ``),
});
</script>

<template>
	<div>
		<AppExpand :when="route.name === 'dash.games.manage.game.design'">
			<!--TODO(component-setup-refactor-routes-2): Getting the following error:
			Type '($event: MouseEvent) => void' is not assignable to type '() => any'.ts(2322)
			but the click emit defined to take no parameters.
			-->
			<AppEditableOverlay @click="showEditHeader()">
				<template #overlay>
					<span>
						<div v-if="!game!.header_media_item">
							{{ $gettext(`Upload Game Header`) }}
						</div>
						<div v-else>
							{{ $gettext(`Change Header`) }}
						</div>
					</span>
				</template>

				<!-- If no header yet, show their highlight color with a min-height. -->
				<div
					class="fill-highlight"
					:style="{
						'min-height': !game!.header_media_item ? '200px' : '',
					}"
				>
					<AppMediaItemCover
						v-if="game!.header_media_item"
						:media-item="game!.header_media_item"
					/>
				</div>
			</AppEditableOverlay>
		</AppExpand>

		<AppExpand :when="route.name === 'dash.games.manage.game.design'">
			<AppManageGameMediaBar :game="game!" :media-items="media" />
		</AppExpand>

		<div v-if="Screen.isMobile" class="container">
			<br />
			<AppNavTabList>
				<AppManageGameNav />
			</AppNavTabList>
		</div>

		<section class="section">
			<div class="container">
				<div class="row">
					<div v-if="Screen.isDesktop" class="col-md-2">
						<nav class="platform-list">
							<AppManageGameNav />
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
