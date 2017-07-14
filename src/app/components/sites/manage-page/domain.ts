import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./domain.html';

import { Site } from '../../../../lib/gj-lib-client/components/site/site-model';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';

@View
@Component({})
export class AppSitesManagePageDomain extends Vue {
	@Prop(Site) site?: Site;

	onDomainSaved() {
		Growls.success(
			this.$gettext(`Your domain settings have been saved.`),
			this.$gettext(`Domain Saved`)
		);
	}
}
