// import Vue from 'vue';
// import VueRouter from 'vue-router';
// import { Mutation } from 'vuex-class';
// import { Component, Watch } from 'vue-property-decorator';
// import * as View from '!view!./fallback.html';

// import { Store } from '../store/index';
// import { BeforeRouteEnter } from '../../lib/gj-lib-client/utils/router';
// import { bootstrapNg } from '../bootstrap-ng';

// @View
// @Component({})
// export default class RouteFallback extends Vue
// {
// 	@Mutation setAngularPayload: Store['setAngularPayload'];

// 	html = '';
// 	isBootstrapped = false;

// 	private ngInjector?: ng.auto.IInjectorService;

// 	@BeforeRouteEnter({ cache: false, lazy: false })
// 	routeEnter( this: undefined, route: VueRouter.Route )
// 	{
// 		console.log( 'route enter' );
// 		if ( route.meta && route.meta.resolve ) {
// 			return route.meta.resolve( route );
// 		}

// 		return undefined;
// 	}

// 	@Watch( '$route', { immediate: true } )
// 	onRouteChange()
// 	{
// 		this.html = `
// 			<gj-app
// 				controller="${ this.$route.meta.controller }"
// 				controller-as="${ this.$route.meta.controllerAs }"
// 				template-url="${ this.$route.meta.templateUrl }"
// 				>
// 				${ this.$route.meta.controller }
// 			</gj-app>
// 		`;
// 	}

// 	routed()
// 	{
// 		console.log( 'routed' );
// 		if ( this.isBootstrapped ) {
// 			return;
// 		}

// 		this.setAngularPayload( this.$payload );
// 		this.ngInjector = bootstrapNg( this.$el );
// 		this.isBootstrapped = true;
// 	}

// 	beforeRouteLeave( _to: VueRouter.Route, _from: VueRouter.Route, next: Function )
// 	{
// 		console.log( 'leave' );

// 		if ( !this.ngInjector ) {
// 			console.log( `Couldn't find ng injector.` );
// 			return next();
// 		}

// 		const e = this.ngInjector.get( '$rootElement' ) as any;
// 		if ( e ) {
// 			e.remove();
// 		}

// 		const r = this.ngInjector.get( '$rootScope' ) as any;
// 		if ( r ) {
// 			r.$destroy();
// 		}

// 		this.ngInjector = undefined;

// 		next();
// 	}
// }
