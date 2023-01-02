<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { vAppAuthRequired } from '../../auth/auth-required-directive';
import { Model } from '../../model/model.service';
import { CommentModal, DisplayMode } from '../modal/modal.service';

@Options({
	directives: {
		AppAuthRequired: vAppAuthRequired,
	},
})
export default class AppCommentAddButton extends Vue {
	@Prop(Object)
	model!: Model;

	@Prop(String)
	placeholder?: string;

	@Prop(String)
	displayMode!: DisplayMode;

	get placeholderText() {
		return this.placeholder ? this.placeholder : this.$gettext('What do you think?');
	}

	open() {
		CommentModal.show({
			model: this.model,
			displayMode: this.displayMode,
		});
	}
}
</script>

<template>
	<div v-app-auth-required>
		<div class="comment-add-button" @click="open()">
			{{ placeholderText }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.comment-add-button
	input-placeholder-button()
	change-bg('bg')
	margin-bottom: $line-height-computed
</style>
