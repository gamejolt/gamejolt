import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import './dogtag.styl';

@Component({})
export default class AppUserDogtag extends Vue {
	@Prop(String) type!: string;
}
