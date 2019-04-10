import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppGameListPlaceholder extends Vue {
	@Prop(Number) num!: number;
}
