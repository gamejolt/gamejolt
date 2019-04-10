import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { Site } from 'game-jolt-frontend-lib/components/site/site-model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Store } from '../../../store/index';
import FormSiteDomain from '../../forms/site/domain/domain.vue';


@Component({
	components: {
		FormSiteDomain,
	},
})
export default class AppSitesManagePageDomain extends Vue {
	@Prop(Site) site!: Site;
	@Prop(Game) game?: Game;

	@State app!: Store['app'];

	onDomainSaved() {
		Growls.success(
			this.$gettext(`Your domain settings have been saved.`),
			this.$gettext(`Domain Saved`)
		);
	}
}
