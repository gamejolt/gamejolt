import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../utils/vue';
import './backdrop-global.styl';
import { Backdrop } from './backdrop.service';

@Component({})
export default class AppBackdrop extends Vue {
	@Prop(propOptional(String)) className?: string;

	remove() {
		Backdrop.remove(this);
	}

	_clicked() {
		this.$emit('clicked');
	}
}
