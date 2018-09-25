import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./input.html?style=./input.styl';

import { findRequiredVueParent } from '../../../../lib/gj-lib-client/utils/vue';
import { AppSearch } from '../search';

@View
@Component({})
export class AppSearchInput extends Vue {
	@Prop(String) value!: string;

	mounted() {
		const search = findRequiredVueParent(this, AppSearch);
		search.inputElem = this.$el;
	}

	onChange(val: string) {
		this.$emit('input', val);
	}
}
