import { Options, Prop, Vue } from 'vue-property-decorator';
import AppLoading from '../loading.vue';

@Options({
	components: {
		AppLoading,
	},
})
export default class AppLoadingFade extends Vue {
	@Prop(Boolean)
	isLoading!: boolean;
}
