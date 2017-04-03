import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./forgot-sent.html';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';

@View
@Component({})
export default class RouteAuthForgotSent extends Vue
{
	created()
	{
		Meta.title = this.$gettext( 'auth.forgot.sent.page_title' );
	}
}
