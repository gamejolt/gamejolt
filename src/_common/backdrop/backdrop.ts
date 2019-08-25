import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import './backdrop-global.styl';
import { Backdrop } from './backdrop.service';

@Component({})
export default class AppBackdrop extends Vue {
	@Prop(String)
	className?: string;

	active = false;

	async created() {
		await this.$nextTick();
		this.active = true;
	}

	remove() {
		// This will start a transition.
		// At the end of the leave transition it will call `_transitionend`.
		this.active = false;
		Backdrop.checkBackdrops();
	}

	_clicked() {
		this.$emit('clicked');
	}

	_transitionend() {
		if (!this.active) {
			Backdrop.remove(this);
		}
	}
}
