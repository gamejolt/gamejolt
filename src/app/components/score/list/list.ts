import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { AppTimeAgo } from 'game-jolt-frontend-lib/components/time/ago/ago';
import { UserGameScore } from 'game-jolt-frontend-lib/components/user/game-score/game-score.model';
import AppUserAvatar from 'game-jolt-frontend-lib/components/user/user-avatar/user-avatar.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppUserAvatar,
		AppTimeAgo,
	},
	filters: {
		number,
	},
})
export default class AppScoreList extends Vue {
	@Prop(Array) scores!: UserGameScore[];
	@Prop(Number) startRank?: number;
	@Prop(Number) step?: number;

	readonly Environment = Environment;
}
