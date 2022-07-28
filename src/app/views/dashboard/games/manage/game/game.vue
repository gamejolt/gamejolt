<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import AppEditableOverlay from '../../../../../../_common/editable-overlay/AppEditableOverlay.vue';
import AppExpand from '../../../../../../_common/expand/AppExpand.vue';
import { Game } from '../../../../../../_common/game/game.model';
import AppMediaItemCover from '../../../../../../_common/media-item/cover/cover.vue';
import AppNavTabList from '../../../../../../_common/nav/tab-list/tab-list.vue';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../_common/route/route-component';
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
@OptionsForRoute()
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
		<AppExpand :when="$route.name === 'dash.games.manage.game.design'">
			<AppEditableOverlay @click="showEditHeader()">
				<template #overlay>
					<span>
						<AppTranslate v-if="!game.header_media_item">
							Upload Game Header
						</AppTranslate>
						<AppTranslate v-else>Change Header</AppTranslate>
					</span>
				</template>

				<!-- If no header yet, show their highlight color with a min-height. -->
				<div
					class="fill-highlight"
					:style="{
						'min-height': !game.header_media_item ? '200px' : '',
					}"
				>
					<AppMediaItemCover
						v-if="game.header_media_item"
						:media-item="game.header_media_item"
					/>
				</div>
			</AppEditableOverlay>
		</AppExpand>

		<AppExpand :when="$route.name === 'dash.games.manage.game.design'">
			<AppManageGameMediaBar :game="game" :media-items="media" />
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
