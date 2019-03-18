import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { Store } from '../../../store/index';

@Component({})
export default class AppEmbedApplet extends Vue {
	@State url!: Store['url'];
	@State build!: Store['build'];
	@State username!: Store['username'];
	@State token!: Store['token'];
	@State javaArchive!: Store['javaArchive'];
	@State javaCodebase!: Store['javaCodebase'];
	@State embedWidth!: Store['embedWidth'];
	@State embedHeight!: Store['embedHeight'];
}
