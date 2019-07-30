import Vue from 'vue';
import Component from 'vue-class-component';

@Component({})
export default class AppEventItemControlsCommentAddPlaceholder extends Vue {
	onClick() {
		this.$emit('click');
	}
}
