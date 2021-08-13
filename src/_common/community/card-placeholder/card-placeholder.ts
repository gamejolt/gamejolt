import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional } from '../../../utils/vue';
import AppButtonPlaceholder from '../../button/placeholder/placeholder.vue';
import { Environment } from '../../environment/environment.service';

@Component({
	components: { AppButtonPlaceholder },
})
export default class AppCommunityCardPlaceholder extends Vue {
	@Prop(propOptional(Boolean, false)) elevate!: boolean;

	readonly Environment = Environment;
}
