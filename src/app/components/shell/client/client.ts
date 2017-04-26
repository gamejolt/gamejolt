import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./client.html';

import { AppClientTray } from '../../client/tray/tray';

@View
@Component({
	components: {
		AppClientTray,
	},
})
export class AppClient extends Vue
{
}
