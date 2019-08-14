import Vue from 'vue';
import { Sketch } from 'vue-color';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Popper } from '../../components/popper/popper.service';
import AppJolticon from '../../vue/components/jolticon/jolticon.vue';
import AppPopper from '../popper/popper.vue';

@Component({
	components: {
		picker: Sketch,
		AppPopper,
		AppJolticon,
	},
})
export default class AppColorpicker extends Vue {
	@Prop(String)
	value!: string;

	colors: any = {};

	@Watch('value', { immediate: true })
	onValueChanged() {
		this.colors = {
			hex: this.value,
		};
	}

	onChange(value: any) {
		this.colors = value;
	}

	accept() {
		this.$emit('input', this.colors.hex);
		Popper.hideAll();
	}

	cancel() {
		this.colors = {
			hex: this.value,
		};
		Popper.hideAll();
	}
}
