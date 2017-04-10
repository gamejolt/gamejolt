import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import './forums-content.styl';

@Component({})
export default class RouteForums extends Vue
{
	render( h: Vue.CreateElement )
	{
		return h( 'router-view', { staticClass: 'route-forums' } );
	}
}
