<script lang="ts">
import { Emit, Options, Vue } from 'vue-property-decorator';

@Options({})
export default class AppActivityFeedNewButton extends Vue {
	@Emit('click') emitClick(_e: Event) {}
}
</script>

<template>
	<p>
		<AppButton outline primary block @click="emitClick">
			<slot />
		</AppButton>
	</p>
</template>
