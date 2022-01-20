<script lang="ts">
import { defineComponent, h } from 'vue';

export default defineComponent({
	name: 'AppStyle',
	props: {
		content: {
			type: String,
			required: true,
		},
	},
	render() {
		return h('style', { innerHTML: this.$props.content });
	},
});
</script>
