import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./finalize.html';

import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { Auth } from '../../../../../../lib/gj-lib-client/components/auth/auth.service';
import { FormTwitterEmail } from '../../../../../components/forms/twitter-email/twitter-email';

@View
@Component({
	components: {
		FormTwitterEmail,
	},
})
export default class RouteAuthLinkedAccountTwitterFinalize extends Vue {
	@Prop(String) state: string;

	created() {
		Meta.title = this.$gettext(
			'auth.linked_account.twitter.finalize.page_title'
		);
	}

	onSubmitted() {
		Growls.success(
			this.$gettext('auth.linked_account.twitter.created_growl'),
			this.$gettext('auth.linked_account.twitter.created_growl_title')
		);
		setTimeout(() => Auth.redirectDashboard(), 3000);
	}
}
