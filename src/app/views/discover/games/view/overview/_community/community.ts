import AppCard from 'game-jolt-frontend-lib/components/card/card.vue';
import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';

@Component({
	components: {
		AppCard,
		AppTheme,
	},
})
export default class AppDiscoverGamesViewOverviewCommunity extends Vue {
	@Prop(Community)
	community!: Community;

	readonly number = number;
}
