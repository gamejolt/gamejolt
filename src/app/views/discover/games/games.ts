import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({})
export default class RouteDiscoverGames extends Vue
{
	render( h: Vue.CreateElement )
	{
		return h( 'router-view' );
	}
}
