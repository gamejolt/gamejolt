import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppEventItemMediaIndicator extends Vue {
	@Prop(Number)
	count!: number;

	@Prop(Number)
	current!: number;
}
