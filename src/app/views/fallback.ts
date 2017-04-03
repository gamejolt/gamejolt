import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import '../bootstrap-ng';

@Component({})
export default class RouteNgFallback extends Vue
{
	render( h: Vue.CreateElement )
	{
		return h( 'div', {
			domProps: {
				innerHTML: '<gj-app></gj-app>',
			}
		} );
	}
}
