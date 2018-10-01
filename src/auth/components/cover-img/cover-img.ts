import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import View from '!view!./cover-img.html?style=./cover-img.styl';

import { ImgHelper } from '../../../lib/gj-lib-client/components/img/helper/helper-service';

@View
@Component({})
export class AppCoverImg extends Vue {
	@Prop(String) imgUrl!: string;

	isLoaded = false;

	@Watch('imgUrl', { immediate: true })
	async onChanged() {
		this.isLoaded = false;
		await ImgHelper.loaded(this.imgUrl);
		this.isLoaded = true;
	}
}
