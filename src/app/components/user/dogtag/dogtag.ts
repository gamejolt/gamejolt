import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./dogtag.html';
import './dogtag.styl';

@View
@Component({})
export class AppUserDogtag extends Vue {
	@Prop(String) type: string;
}
