import Vue from 'vue';
import { Component, Prop, Emit } from 'vue-property-decorator';

@Component({})
export default class AppEditableOverlay extends Vue {
	@Prop(Boolean) disabled?: boolean;

	@Emit()
	click() {}
}
