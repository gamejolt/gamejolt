import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./placeholder.html?style=./placeholder.styl';

@View
@Component({})
export class AppGameListPlaceholder extends Vue {
	@Prop(Number) num: number;
}
