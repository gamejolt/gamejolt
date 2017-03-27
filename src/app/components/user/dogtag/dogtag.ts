import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./dogtag.html';
import './dogtag.styl';

@View
@Component({
	name: 'user-dogtag',
})
export class AppUserDogtag extends Vue
{
	@Prop( String ) type: string;
}
