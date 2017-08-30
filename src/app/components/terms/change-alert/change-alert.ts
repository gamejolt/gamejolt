import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./change-alert.html';
import { AppAlertDismissable } from '../../../../lib/gj-lib-client/components/alert/dismissable/dismissable';

@View
@Component({
	components: {
		AppAlertDismissable,
	},
})
export class AppTermsChangeAlert extends Vue {}
