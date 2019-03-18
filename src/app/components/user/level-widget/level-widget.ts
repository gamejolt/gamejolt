import AppProgressBar from 'game-jolt-frontend-lib/components/progress/bar/bar.vue';
import { AppTooltip } from 'game-jolt-frontend-lib/components/tooltip/tooltip';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppProgressBar,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		number,
	},
})
export default class AppUserLevelWidget extends Vue {
	@Prop(User) user!: User;

	get tooltip() {
		return this.$gettextInterpolate('%{ percentage }% progress to next level', {
			percentage: this.user.level_next_percentage,
		});
	}
}
