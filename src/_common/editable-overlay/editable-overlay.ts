import { Emit, Options, Prop, Vue } from 'vue-property-decorator';

@Options({})
export default class AppEditableOverlay extends Vue {
	@Prop(Boolean) disabled?: boolean;

	@Emit()
	click() {}
}
