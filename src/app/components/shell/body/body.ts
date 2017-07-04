import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./body.html';

import { AppShellFooter } from '../footer/footer';
import { AppPopoverContext } from '../../../../lib/gj-lib-client/components/popover/popover-context';

// Includes global styling.
require('./body.styl');

@View
@Component({
	components: {
		AppPopoverContext,
		AppShellFooter,
	},
})
export class AppShellBody extends Vue {}
