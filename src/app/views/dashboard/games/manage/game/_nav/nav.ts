import { ContentContainer } from 'game-jolt-frontend-lib/components/content/content-container';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { AppGamePerms } from '../../../../../../components/game/perms/perms';
import { RouteStore, RouteStoreModule } from '../../manage.store';
import AppManageGameNavRequired from './required.vue';

@Component({
	components: {
		AppManageGameNavRequired,
		AppGamePerms,
	},
})
export default class AppManageGameNav extends Vue {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	@RouteStoreModule.State
	isWizard!: RouteStore['isWizard'];

	@RouteStoreModule.State
	canPublish!: RouteStore['canPublish'];

	@RouteStoreModule.Action
	saveDraft!: RouteStore['saveDraft'];

	@RouteStoreModule.Action
	publish!: RouteStore['publish'];

	@State
	app!: AppStore;

	get hasDescription() {
		const container = ContentContainer.fromJson(this.game.description_content);
		return container.hasContent;
	}

	Game = Game;
}
