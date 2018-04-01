import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./cluster.html?style=./cluster.styl';

import { ThemeModel } from '../theme.model';

@View
@Component({})
export class AppThemeCluster extends Vue {
	@Prop(ThemeModel) theme: ThemeModel;
}
