import Vue from 'vue';
import Component from 'vue-class-component';

@Component({})
export default class AppEventItemControlsCommentAddPlaceholder extends Vue {
	onClick(type: string) {
		this.$emit('click', type);
	}
}
