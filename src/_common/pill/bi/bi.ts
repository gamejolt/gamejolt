import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { Location } from 'vue-router';
import { propOptional } from '../../../utils/vue';

@Component({})
export default class AppPillBi extends Vue {
	@Prop(propOptional(Object))
	leftTo?: string | Location;

	@Prop(propOptional(Object))
	rightTo?: string | Location;

	@Prop(propOptional(Boolean, false))
	noHover!: boolean;

	@Emit('click-left') emitClickLeft(_e: MouseEvent) {}
	@Emit('click-right') emitClickRight(_e: MouseEvent) {}

	get leftComponent() {
		if (this.leftTo) {
			return 'router-link';
		}

		if (this.hasLeftClickListener) {
			return 'a';
		}

		return 'span';
	}

	get hasLeftClickListener() {
		return !!this.$listeners['left-click'];
	}

	get rightComponent() {
		if (this.rightTo) {
			return 'router-link';
		}

		if (this.hasRightClickListener) {
			return 'a';
		}

		return 'span';
	}

	get hasRightClickListener() {
		return !!this.$listeners['right-click'];
	}

	get hasImg() {
		return !!this.$slots.img;
	}

	onClickLeft(e: MouseEvent) {
		if (this.leftComponent === 'span') {
			return;
		}

		this.emitClickLeft(e);
	}

	onClickRight(e: MouseEvent) {
		if (this.rightComponent === 'span') {
			return;
		}

		this.emitClickRight(e);
	}
}
