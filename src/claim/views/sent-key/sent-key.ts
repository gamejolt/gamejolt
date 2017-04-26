import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./sent-key.html';

import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';

@View
@Component({})
export default class RouteSentKey extends Vue
{
	created()
	{
		Meta.title = this.$gettext( 'Keys Sent' );
	}
}
