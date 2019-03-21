import { findRequiredVueParent } from 'game-jolt-frontend-lib/utils/vue';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppSearchTS from '../search';
import AppSearch from '../search.vue';

@Component({})
export default class AppSearchInput extends Vue {
	@Prop(String) value!: string;

	mounted() {
		const search = findRequiredVueParent(this, AppSearch) as AppSearchTS;
		search.inputElem = this.$el as HTMLElement;
	}

	onChange(val: string) {
		this.$emit('input', val);
	}
}
