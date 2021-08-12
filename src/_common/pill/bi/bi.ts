import { Options, Prop, Vue } from 'vue-property-decorator';
import { Location } from 'vue-router';
import { propOptional } from '../../../utils/vue';

@Options({})
export default class AppPillBi extends Vue {
	@Prop(propOptional(Object))
	leftTo?: string | Location;

	@Prop(propOptional(Object))
	rightTo?: string | Location;

	@Prop(propOptional(Boolean, false))
	noHover!: boolean;

	get leftComponent() {
		if (this.leftTo) {
			return 'router-link';
		}

		return 'span';
	}

	get rightComponent() {
		if (this.rightTo) {
			return 'router-link';
		}

		return 'span';
	}

	get hasImg() {
		// TODO(vue3): check
		return !!this.$slots.img;
	}
}
