import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { Store } from '../../../store/index';

@Component({})
export default class AppEmbedHtml extends Vue {
	@State url!: Store['url'];
	@State build!: Store['build'];
	@State embedWidth!: Store['embedWidth'];
	@State embedHeight!: Store['embedHeight'];
}
