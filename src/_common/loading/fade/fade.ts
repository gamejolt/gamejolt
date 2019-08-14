import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppLoading from '../loading.vue';

@Component({
	components: {
		AppLoading,
	},
})
export default class AppLoadingFade extends Vue {
	@Prop(Boolean)
	isLoading!: boolean;
}
