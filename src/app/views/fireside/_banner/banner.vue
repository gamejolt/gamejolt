<script lang="ts">
import { Options, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../utils/vue';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import AppProgressBar from '../../../../_common/progress/bar/bar.vue';
import {
	extendFireside,
	useFiresideController,
} from '../../../components/fireside/controller/controller';

@Options({
	components: {
		AppExpand,
		AppProgressBar,
	},
})
export default class AppFiresideBanner extends Vue {
	c = shallowSetup(() => useFiresideController()!);

	private isLoading = false;

	get shouldShowBanner() {
		return this.isExpiring;
	}

	get isExpiring() {
		return (
			this.c.status.value === 'joined' &&
			this.c.hasExpiryWarning.value &&
			this.c.canExtend.value &&
			!this.c.isStreaming.value &&
			!this.isLoading
		);
	}

	onClickBanner() {
		this.extendFireside();
	}

	private async extendFireside() {
		if (this.isLoading) {
			return;
		}

		try {
			this.isLoading = true;
			await extendFireside(this.c);
		} finally {
			this.isLoading = false;
		}
	}
}
</script>

<template>
	<AppExpand class="fireside-banner" :when="shouldShowBanner">
		<div class="-inner fill-notice" @click="onClickBanner()">
			<div class="-message">
				<AppTranslate>
					Your fireside is expiring soon. Click here to stoke the flames!
				</AppTranslate>
			</div>
		</div>

		<AppProgressBar class="-progress" :percent="c.expiresProgressValue.value" thin />
	</AppExpand>
</template>

<style lang="stylus" scoped>
$-padding = ($grid-gutter-width / 2)
$-padding-xs = ($grid-gutter-width-xs / 2)

.fireside-banner
	width: 100%

.-inner
	display: flex
	align-items: center
	justify-content: center
	padding: ($-padding-xs * 0.5) $-padding-xs
	min-height: $shell-top-nav-height
	font-size: $font-size-small
	user-select: none
	cursor: pointer

	@media $media-sm-up
		padding: ($-padding * 0.5) $-padding
		text-align: center
		font-size: $font-size-base
		font-weight: bold

.-progress
	margin-bottom: 0
</style>
