import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';

@Component({})
export default class AppFormLegend extends Vue {
	@Prop(Boolean)
	compact?: boolean;

	@Prop(Boolean)
	expandable?: boolean;

	@Prop(Boolean)
	expanded?: boolean;

	@Prop(Boolean)
	deletable?: boolean;

	@Emit('delete')
	emitDelete() {}
}
