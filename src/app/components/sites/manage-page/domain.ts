import { Options, Prop, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Game } from '../../../../_common/game/game.model';
import { showSuccessGrowl } from '../../../../_common/growls/growls.service';
import { Site } from '../../../../_common/site/site-model';
import { Store } from '../../../store/index';
import FormSiteDomain from '../../forms/site/domain/domain.vue';

@Options({
	components: {
		FormSiteDomain,
	},
})
export default class AppSitesManagePageDomain extends Vue {
	@Prop(Object) site!: Site;
	@Prop(Object) game?: Game;

	@State app!: Store['app'];

	onDomainSaved() {
		showSuccessGrowl(
			this.$gettext(`Your domain settings have been saved.`),
			this.$gettext(`Domain Saved`)
		);
	}
}
