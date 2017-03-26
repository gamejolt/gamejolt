import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./hot-bottom.html?style=./hot-bottom.styl';

@View
@Component({
	name: 'shell-hot-bottom',
})
export class AppShellHotBottom extends Vue
{
}
