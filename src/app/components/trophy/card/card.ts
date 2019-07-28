import { BaseTrophy } from 'game-jolt-frontend-lib/components/trophy/base-trophy';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppTrophyThumbnail from '../thumbnail/thumbnail.vue';

@Component({
	components: {
		AppTrophyThumbnail,
	},
})
export default class AppTrophyCard extends Vue {
	@Prop(Object)
	trophy!: BaseTrophy;

	get mainClass() {
		return '-trophy-difficulty-' + this.trophy.difficulty;
	}
}
