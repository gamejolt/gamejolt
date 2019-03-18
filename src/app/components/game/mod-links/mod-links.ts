import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppJolticon,
	},
})
export default class AppGameModLinks extends Vue {
	@Prop(Object) game!: Game;

	Environment = Environment;

	async tag(tag: string) {
		// It won't return what site api expects for output, so gotta catch.
		try {
			await Api.sendRequest(`/games/tags/tag/${this.game.id}/${tag}`, null, {
				apiPath: '/moderate',
				processPayload: false,
			});
		} catch (_e) {
			Growls.success('Tagged the game.');
		}
	}

	async untag(tag: string) {
		// It won't return what site api expects for output, so gotta catch.
		try {
			await Api.sendRequest(`/games/tags/untag/${this.game.id}/${tag}`, null, {
				apiPath: '/moderate',
				processPayload: false,
			});
		} catch (_e) {
			Growls.success('Untagged the game.');
		}
	}
}
