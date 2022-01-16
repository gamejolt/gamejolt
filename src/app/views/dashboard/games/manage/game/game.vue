<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/editable-overlay.vue';
import AppExpand from '../../../../../../_common/expand/expand.vue';
import { Game } from '../../../../../../_common/game/game.model';
import AppMediaItemCover from '../../../../../../_common/media-item/cover/cover.vue';
import AppNavTabList from '../../../../../../_common/nav/tab-list/tab-list.vue';
import { BaseRouteComponent } from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { GameHeaderModal } from '../../../../../components/game/header-modal/header-modal.service';
import { useGameDashRouteController } from '../manage.store';
import AppManageGameMediaBar from './_media-bar/media-bar.vue';
import AppManageGameNav from './_nav/nav.vue';

@Options({
	name: 'RouteDashGamesManageGame',
	components: {
		AppExpand,
		AppManageGameNav,
		AppManageGameMediaBar,
		AppNavTabList,
		AppEditableOverlay,
		AppMediaItemCover,
	},
})
export default class RouteDashGamesManageGame extends BaseRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}
	get media() {
		return this.routeStore.media;
	}
	get canPublish() {
		return this.routeStore.canPublish;
	}

	readonly Game = Game;
	readonly Screen = Screen;

	showEditHeader() {
		GameHeaderModal.show(this.game);
	}
}
</script>

<template>
	<div>
		<app-expand :when="$route.name === 'dash.games.manage.game.design'">
			<app-editable-overlay @click="showEditHeader()">
				<template #overlay>
					<span>
						<translate v-if="!game.header_media_item">Upload Game Header</translate>
						<translate v-else>Change Header</translate>
					</span>
				</template>

				<!-- If no header yet, show their highlight color with a min-height. -->
				<div
					class="fill-highlight"
					:style="{
						'min-height': !game.header_media_item ? '200px' : '',
					}"
				>
					<app-media-item-cover
						v-if="game.header_media_item"
						:media-item="game.header_media_item"
					/>
				</div>
			</app-editable-overlay>
		</app-expand>

		<app-expand :when="$route.name === 'dash.games.manage.game.design'">
			<app-manage-game-media-bar :game="game" :media-items="media" />
		</app-expand>

		<div v-if="Screen.isMobile" class="container">
			<br />
			<app-nav-tab-list>
				<app-manage-game-nav />
			</app-nav-tab-list>
		</div>

		<section class="section">
			<div class="container">
				<div class="row">
					<div v-if="Screen.isDesktop" class="col-md-2">
						<nav class="platform-list">
							<app-manage-game-nav />
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
