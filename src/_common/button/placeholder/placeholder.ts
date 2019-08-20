import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppButtonPlaceholder extends Vue {
	@Prop(Boolean)
	sparse?: boolean;
	@Prop(Boolean)
	circle?: boolean;
	@Prop(Boolean)
	block?: boolean;
}
