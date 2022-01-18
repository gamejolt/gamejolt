<script lang="ts">
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
		return !!this.$slots.img;
	}
}
</script>

<template>
	<span class="pill-bi">
		<component :is="leftComponent" class="-left" :class="{ '-no-hover': noHover }" :to="leftTo">
			<span class="-content">
				<span v-if="hasImg" class="-img">
					<slot name="img" />
				</span>
				<slot name="left" />
			</span>

			<span class="-sep">
				<span class="-container">
					<svg
						class="-svg"
						xmlns="http://www.w3.org/2000/svg"
						version="1.1"
						viewBox="0 0 100 100"
						preserveAspectRatio="none"
					>
						<polygon points="0,0 100,0 0,100" />
					</svg>
				</span>
			</span>
		</component>

		<component
			:is="rightComponent"
			class="-right"
			:class="{ '-no-hover': noHover }"
			:to="rightTo"
		>
			<slot name="right" />
		</component>
	</span>
</template>

<style lang="stylus" src="./bi.styl" scoped></style>
