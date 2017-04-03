import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
const template: string = require( '!html-loader!markdown-loader!../../../../lib/terms/terms/global.md' );

@Component({})
export default class RouteLegalTerms extends Vue
{
	created()
	{
		Meta.title = 'Terms of Use';
	}

	render( h: Vue.CreateElement )
	{
		return h( 'div', { domProps: { innerHTML: template } } );
	}
}
