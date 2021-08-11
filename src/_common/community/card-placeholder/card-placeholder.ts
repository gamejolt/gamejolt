import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import AppButtonPlaceholder from '../../button/placeholder/placeholder.vue';
import { Environment } from '../../environment/environment.service';

@Options({
	components: { AppButtonPlaceholder },
})
export default class AppCommunityCardPlaceholder extends Vue {
	@Prop(propOptional(Boolean, false)) elevate!: boolean;

	readonly Environment = Environment;
}
