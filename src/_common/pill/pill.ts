import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppPill extends Vue {
	@Prop(Object)
	to?: any;

	get component() {
		return this.to ? 'router-link' : 'div';
	}

	get hasImg() {
		return !!this.$slots.img;
	}
}
