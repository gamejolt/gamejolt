import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import View from '!view!./silverlight.html';

import { Store } from '../../../store/index';

@View
@Component({})
export class AppEmbedSilverlight extends Vue {
	@State url!: Store['url'];
	@State build!: Store['build'];
	@State username!: Store['username'];
	@State token!: Store['token'];
	@State embedWidth!: Store['embedWidth'];
	@State embedHeight!: Store['embedHeight'];
}
