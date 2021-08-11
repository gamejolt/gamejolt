import { Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppPill extends Vue {
	@Prop({ type: Object, required: false })
	to?: any;

	get component() {
		if (this.to) {
			return 'router-link';
		}

		if (this.hasClickListener) {
			return 'a';
		}

		return 'div';
	}

	get hasImg() {
		return !!this.$slots.img;
	}

	get hasClickListener() {
		return !!this.$listeners.click;
	}

	onClick(e: MouseEvent) {
		if (this.component === 'div') {
			return;
		}

		this.$emit('click', e);
	}
}
