<script lang="ts">
import { setup } from 'vue-class-component';
import { Options, Prop, Vue } from 'vue-property-decorator';
import { formatNumber } from '../../../../../_common/filters/number';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppPostControlsStats extends Vue {
	@Prop({ type: Object, required: true })
	post!: FiresidePost;

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
		<translate
			:translate-n="post.view_count || 0"
			:translate-params="{ count: formatNumber(post.view_count || 0) }"
			translate-plural="%{ count } views"
		>
			%{ count } view
		</translate>
	</div>
</template>
