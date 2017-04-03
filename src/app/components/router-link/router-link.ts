import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
// import { StateService } from 'angular-ui-router';

// import { getProvider } from '../../../lib/gj-lib-client/utils/utils';

interface RouterLinkLocation
{
	name: string;
	params?: any;
	opts?: any;
	query?: any;
}

// Gotta wait till app is bootstrapped to get provider.
// let $state: StateService;

function guardEvent( e: MouseEvent, to: RouterLinkLocation )
{
	// Don't redirect with control keys.
	if ( e.metaKey || e.ctrlKey || e.shiftKey ) {
		return;
	}

	// Don't redirect when preventDefault called.
	if ( e.defaultPrevented ) {
		return;
	}

	// Don't redirect on right click.
	if ( e.button !== undefined && e.button !== 0 ) {
		return;
	}

	// Don't redirect if `target="_blank"`.
	if ( e.target && (e.target as HTMLElement).getAttribute ) {
		const target = (e.target as HTMLElement).getAttribute( 'target' );
		if ( /\b_blank\b/i.test( target || '' ) ) {
			return;
		}
	}

	// this may be a Weex event which doesn't have this method
	if ( e.preventDefault ) {
		e.preventDefault();
	}

	// $state.go( to.name, to.params, to.opts );

	return true;
}

function findAnchor( children: Vue.VNode[] ): Vue.VNode | undefined
{
	if ( children ) {
		let child: Vue.VNode | undefined;
		for ( let i = 0; i < children.length; i++ ) {
			child = children[ i ];
			if ( child.tag === 'a' ) {
				return child;
			}
			if ( child.children && (child = findAnchor( child.children )) ) {
				return child;
			}
		}
	}
	return undefined;
}

@Component({})
export class AppRouterLink extends Vue
{
	@Prop( { type: Object, required: true } ) to: RouterLinkLocation;
	@Prop( { type: String, default: 'a' } ) tag: string;
	@Prop( Boolean ) exact: boolean;
	@Prop( Boolean ) replace: boolean;
	@Prop( String ) activeClass: string;

	created()
	{
		// if ( !$state ) {
		// 	$state = getProvider<StateService>( '$state' );
		// }
	}

	render( h: Vue.CreateElement )
	{
		const activeClass = this.activeClass || 'router-link-active';
		// const href = $state.href( this.to.name, this.to.params, this.to.opts );
		const href = '';

		const classes = {
			[activeClass]: true,
			// [activeClass]: this.exact
			// 	? $state.is( this.to.name, this.to.params, this.to.opts )
			// 	: $state.includes( this.to.name, this.to.params, this.to.opts ),
		};

		const on = {
			click: ( e: MouseEvent ) => guardEvent( e, this.to ),
		};

		const data: any = {
			class: classes,
		};

		if ( this.tag === 'a' ) {
			data.on = on;
			data.attrs = { href };
		}
		else {
			const a: any = findAnchor( this.$slots.default );
			if ( a ) {
				a.isStatic = false;
				const aData = a.data = Object.assign( {}, a.data );
				aData.on = on;
				const aAttrs = a.data.attrs = Object.assign( {}, a.data.attrs );
				aAttrs.href = href;
			}
			else {
				data.on = on;
			}
		}

		return h( this.tag, data, this.$slots.default );
	}
}
