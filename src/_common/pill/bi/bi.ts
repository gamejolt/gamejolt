import { Options, Prop, Vue } from 'vue-property-decorator';
import { RouteLocationRaw } from 'vue-router';

@Options({})
export default class AppPillBi extends Vue {
	@Prop(Object)
	leftTo?: RouteLocationRaw;

	@Prop(Object)
	rightTo?: RouteLocationRaw;

	@Prop({ type: Boolean, default: false })
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
