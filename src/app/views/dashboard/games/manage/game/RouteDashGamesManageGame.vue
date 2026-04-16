<script lang="ts">
import { useRoute } from 'vue-router';

import { showGameHeaderModal } from '~app/components/game/header-modal/header-modal.service';
import AppGameManageMediaBar from '~app/views/dashboard/games/manage/game/_media-bar/AppGameManageMediaBar.vue';
import AppGameManageNav from '~app/views/dashboard/games/manage/game/_nav/AppGameManageNav.vue';
import { useGameDashRouteController } from '~app/views/dashboard/games/manage/manage.store';
import AppEditableOverlay from '~common/editable-overlay/AppEditableOverlay.vue';
import AppExpand from '~common/expand/AppExpand.vue';
import AppMediaItemCover from '~common/media-item/cover/AppMediaItemCover.vue';
import AppNavTabList from '~common/nav/tab-list/AppNavTabList.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '~common/route/route-component';
import { Screen } from '~common/screen/screen-service';

export default {
	...defineAppRouteOptions({
		reloadOn: 'always',
	}),
};
</script>

<script lang="ts" setup>
const route = useRoute();
const { game, media } = useGameDashRouteController()!;

function showEditHeader() {
	showGameHeaderModal(game.value!);
}

createAppRoute({});
</script>

<template>
	<div>
		<AppExpand :when="route.name === 'dash.games.manage.game.design'">
			<AppEditableOverlay @toggle="showEditHeader()">
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
			<AppGameManageMediaBar :game="game!" :media-items="media" />
		</AppExpand>

		<div v-if="Screen.isMobile" class="container">
			<br />
			<AppNavTabList>
				<AppGameManageNav />
			</AppNavTabList>
		</div>

		<section class="section">
			<div class="container">
				<div class="row">
					<div v-if="Screen.isDesktop" class="col-md-2">
						<nav class="platform-list">
							<AppGameManageNav />
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
