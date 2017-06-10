import * as nwGui from 'nw.gui';

import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./footer.html?style=./footer.styl';

import { Environment } from '../../../../lib/gj-lib-client/components/environment/environment.service';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppRouterLink } from '../../router-link/router-link';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTranslateLangSelector } from '../../../../lib/gj-lib-client/components/translate/lang-selector/lang-selector';
import { date } from '../../../../lib/gj-lib-client/vue/filters/date';
import { ClientInfo } from '../../client/info/info.service';

@View
@Component({
	components: {
		AppRouterLink,
		AppJolticon,
		AppTranslateLangSelector,
	},
	directives: {
		AppTrackEvent,
	},
	filters: {
		date,
	}
})
export class AppShellFooter extends Vue
{
	curDate = new Date();
	env = Environment;

	get clientVersion()
	{
		if ( GJ_IS_CLIENT ) {
			return ( require( '../../client/info/info.service' ).ClientInfo as typeof ClientInfo ).version;
		}
	}

	// We have to refresh the whole browser when language changes so that
	// all the new language strings get picked up.
	onLangChange()
	{
		if ( !GJ_IS_CLIENT ) {
			window.location.reload();
		}
		else {
			const gui = require( 'nw.gui' ) as typeof nwGui;
			gui.Window.get().reloadDev();
		}
	}

	showSystemReport()
	{
		if ( GJ_IS_CLIENT ) {
			// TODO
			// getProvider<any>( 'Client_SystemReportModal' ).show();
		}
	}
}
