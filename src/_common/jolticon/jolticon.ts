import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppJolticon extends Vue {
	@Prop(String) icon!: string;
	@Prop(Boolean) big?: boolean;
	@Prop(Boolean) highlight?: boolean;
	@Prop(Boolean) notice?: boolean;
}
