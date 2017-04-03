import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./input.html?style=./input.styl';

import { findVueParent } from '../../../../lib/gj-lib-client/utils/vue';
import { AppSearch } from '../search';

@View
@Component({})
export class AppSearchInput extends Vue
{
	@Prop( String ) value: string;

	mounted()
	{
		const search = findVueParent( this, AppSearch ) as AppSearch;
		search.inputElem = this.$el;
	}

	onChange( val: string )
	{
		this.$emit( 'input', val );
	}
}
