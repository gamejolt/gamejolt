import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./minbar.html?style=./minbar.styl';

import { makeObservableService } from '../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../lib/gj-lib-client/components/screen/screen-service';
import { Minbar, MinbarItem } from './minbar.service';
import { AppTooltip } from '../../../lib/gj-lib-client/components/tooltip/tooltip';

@View
@Component({
	directives: {
		AppTooltip,
	},
})
export class AppMinbar extends Vue
{
	Minbar = makeObservableService( Minbar );
	Screen = makeObservableService( Screen );

	onItemClick( item: MinbarItem )
	{
		if ( item.onClick ) {
			item.onClick();
		}
	}
}
