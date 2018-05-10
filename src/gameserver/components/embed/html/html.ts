import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./html.html';

import { Store } from '../../../store/index';

@View
@Component({})
export class AppEmbedHtml extends Vue {
	@State url: Store['url'];
	@State build: Store['build'];
}
