<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppPostControlsStats extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePost;

	@Prop({ type: Boolean, default: false })
	overlay!: boolean;

	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	readonly formatNumber = formatNumber;

	get hasPerms() {
		if (!this.user) {
			return false;
		}
		return this.post.isEditableByUser(this.user);
	}

	get shouldShowStats() {
		return this.hasPerms && this.post.isActive && !this.post.is_processing;
	}
}
</script>

<template>
	<div v-if="shouldShowStats">
		<AppTranslate
			:class="{ '-overlay-text': overlay }"
			:translate-n="post.view_count || 0"
			:translate-params="{ count: formatNumber(post.view_count || 0) }"
			translate-plural="%{ count } views"
		>
			%{ count } view
		</AppTranslate>
	</div>
</template>

<style lang="stylus" scoped>
.-overlay-text
	color: white
	text-shadow: black 1px 1px 4px
</style>
