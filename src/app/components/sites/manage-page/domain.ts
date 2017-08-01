import Vue from 'vue';
import { State } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./domain.html';

import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { FormSiteDomain } from '../../forms/site/domain/domain';
import { Store } from '../../../store/index';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';

@View
@Component({
	components: {
		FormSiteDomain,
	},
})
export class AppSitesManagePageDomain extends Vue {
	@Prop(Site) site: Site;
	@Prop(Game) game?: Game;

	@State app: Store['app'];

	onDomainSaved() {
		Growls.success(
			this.$gettext(`Your domain settings have been saved.`),
			this.$gettext(`Domain Saved`)
		);
	}
}
