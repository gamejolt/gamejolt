import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./forgot.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { FormRetrieveLogin } from '../../../components/forms/retrieve-login/retrieve-login';

@View
@Component({
	components: {
		FormRetrieveLogin,
	},
})
export default class RouteAuthForgot extends Vue {
	created() {
		Meta.title = this.$gettext('auth.forgot.page_title');
	}

	onSubmitted() {
		this.$router.push({ name: 'auth.forgot-sent' });
	}
}
