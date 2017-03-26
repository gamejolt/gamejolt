import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./body.html';

import { Shell } from '../shell-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppShellFooter } from '../footer/footer';
import { AppPopoverContext } from '../../../../lib/gj-lib-client/components/popover/popover-context';

// Includes global styling.
require( './body.styl' );

@View
@Component({
	name: 'shell-body',
	components: {
		AppPopoverContext,
		AppShellFooter,
	}
})
export class AppShellBody extends Vue
{
	Shell = makeObservableService( Shell );
}
