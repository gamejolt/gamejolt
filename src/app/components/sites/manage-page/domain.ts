import { Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Game } from '../../../../_common/game/game.model';
import { Growls } from '../../../../_common/growls/growls.service';
import { Site } from '../../../../_common/site/site-model';
import { Store } from '../../../store/index';
import FormSiteDomain from '../../forms/site/domain/domain.vue';

@Options({
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
