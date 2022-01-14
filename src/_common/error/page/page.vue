<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Vue } from 'vue-property-decorator';
import { useCommonStore } from '../../store/common-store';
import errorImage from './ararat.png';
import { ErrorPages } from './page-components';

@Options({})
export default class AppErrorPage extends Vue {
	commonStore = setup(() => useCommonStore());

	get error() {
		return this.commonStore.error;
	}

	watcher?: Function;

	readonly errorImage = errorImage;

	get page() {
		if (this.error) {
			return ErrorPages[this.error];
		}
	}

	mounted() {
		// We want to do it AFTER the route resolves for the next route we are going to.
		this.watcher = this.$router.afterEach(() => {
			if (this.error) {
				this.commonStore.clearError();
			}
		});
	}

	unmounted() {
		if (this.watcher) {
			this.watcher();
			this.watcher = undefined;
		}
	}
}
</script>

<template>
	<div>
		<section class="container error-page" v-if="error">
			<div class="ararat">
				<img :src="errorImage" :width="416 / 2" :height="760 / 2" alt="" />
			</div>
			<component :is="page" />
			<br />
		</section>
		<template v-else>
			<slot />
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.error-page
	text-align: center

	.ararat
		margin-top: -190px
		margin-bottom: $grid-gutter-width

		@media $media-xs
			margin-bottom: $grid-gutter-width-xs

		> img
			display: block
			margin: 0 auto
</style>
