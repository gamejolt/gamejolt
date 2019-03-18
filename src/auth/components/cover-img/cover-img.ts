import { ImgHelper } from 'game-jolt-frontend-lib/components/img/helper/helper-service';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

@Component({})
export default class AppCoverImg extends Vue {
	@Prop(String) imgUrl!: string;

	isLoaded = false;

	@Watch('imgUrl', { immediate: true })
	async onChanged() {
		this.isLoaded = false;
		await ImgHelper.loaded(this.imgUrl);
		this.isLoaded = true;
	}
}
