import { h } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { findRequiredVueParent } from '../../../utils/vue';
import AppFormControlErrorsTS from './control-errors';

@Options({})
export class AppFormControlError extends Vue {
	@Prop(String) when!: string;
	@Prop(String) message!: string;

	mounted() {
		this.setOverride();
	}

	@Watch('message')
	onMessageChange() {
		this.setOverride();
	}

	private setOverride() {
		const errors = findRequiredVueParent(
			this,
			require('./control-errors.vue').default
		) as AppFormControlErrorsTS;
		errors.setMessageOverride(this.when, this.message);
	}

	render() {
		return h('span');
	}
}
