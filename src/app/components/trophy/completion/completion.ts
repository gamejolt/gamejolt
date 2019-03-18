import AppProgressBar from 'game-jolt-frontend-lib/components/progress/bar/bar.vue';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';


@Component({
	components: {
		AppProgressBar,
		AppJolticon,
	},
	filters: {
		number,
	},
})
export default class AppTrophyCompletion extends Vue {
	@Prop(Number) total!: number;
	@Prop(Number) achieved!: number;
	@Prop(Number) experience!: number;

	number = number;

	get completionRate() {
		return Math.ceil((this.achieved / this.total) * 100);
	}
}
