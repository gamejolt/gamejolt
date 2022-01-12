import { Sketch as Picker } from '@ckpack/vue-color';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Popper } from '../popper/popper.service';
import AppPopper from '../popper/popper.vue';

type VueTouch = {
	hex: string | null;
};

@Options({
	components: {
		Picker,
		AppPopper,
	},
})
export default class AppColorpicker extends Vue {
	@Prop({ type: String, required: true })
	modelValue!: string;

	colors: VueTouch = {
		hex: null,
	};

	@Emit('update:modelValue')
	emitUpdate(_modelValue: string) {}

	@Watch('modelValue', { immediate: true })
	onValueChanged() {
		this.colors = {
			hex: this.modelValue,
		};
	}

	onChange(value: VueTouch) {
		this.colors = value;
	}

	accept() {
		this.emitUpdate(this.colors.hex!);
		Popper.hideAll();
	}

	cancel() {
		this.colors = {
			hex: this.modelValue,
		};
		Popper.hideAll();
	}
}
