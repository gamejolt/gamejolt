<script lang="ts">
import { defineComponent, h } from 'vue';

export default defineComponent({
	props: {
		content: {
			type: String,
			required: true,
		},
	},
	setup(props) {
		return () => h('style', { innerHTML: props.content });
	},
});
</script>
