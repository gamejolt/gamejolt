import { findRequiredVueParent } from 'game-jolt-frontend-lib/utils/vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppSearch from '../search';

@Component({})
export default class AppSearchInput extends Vue {
	@Prop(String) value!: string;

	mounted() {
		const search = findRequiredVueParent(this, AppSearch);
		search.inputElem = this.$el as HTMLElement;
	}

	onChange(val: string) {
		this.$emit('input', val);
	}
}
