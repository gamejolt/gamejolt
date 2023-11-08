<script lang="ts" setup>
import AppButton from './AppButton.vue';
</script>

<template>
	<section id="styleguide-buttons" class="section">
		<h1 class="section-header">Buttons</h1>

		<h3>Button Types</h3>
		<div>
			<AppButton>Default</AppButton>
			<AppButton solid>Solid</AppButton>
			<AppButton primary>Primary</AppButton>
			<AppButton primary solid>Primary Solid</AppButton>
			<AppButton trans>Transparent</AppButton>
			<AppButton primary trans>Primary Transparent</AppButton>
		</div>

		<h3>Icons</h3>
		<div>
			<AppButton icon="heart">Default</AppButton>
			<AppButton icon="heart" solid>Solid</AppButton>
			<AppButton icon="heart" primary>Primary</AppButton>
			<AppButton icon="heart" primary solid>Primary Solid</AppButton>
			<AppButton icon="heart" trans>Transparent</AppButton>
			<AppButton icon="heart" primary trans>Primary Transparent</AppButton>
		</div>

		<h3>Sparse (icon-only)</h3>
		<div>
			<AppButton sparse icon="heart" />
			<AppButton sparse icon="heart" solid />
			<AppButton sparse icon="heart" primary />
			<AppButton sparse icon="heart" primary solid />
			<AppButton sparse icon="heart" trans />
			<AppButton sparse icon="heart" primary trans />
		</div>

		<h3>Circle (icon-only)</h3>
		<div>
			<AppButton circle icon="heart" />
			<AppButton circle icon="heart" solid />
			<AppButton circle icon="heart" primary />
			<AppButton circle icon="heart" primary solid />
			<AppButton circle icon="heart" trans />
			<AppButton circle icon="heart" primary trans />
		</div>

		<h3>Badges</h3>
		<div>
			<AppButton badge="42">Default</AppButton>
			<AppButton badge="42" solid>Solid</AppButton>
			<AppButton badge="42" primary>Primary</AppButton>
			<AppButton badge="42" primary solid>Primary Solid</AppButton>
			<AppButton badge="42" trans>Transparent</AppButton>
			<AppButton badge="42" primary trans>Primary Transparent</AppButton>
		</div>

		<h3>Overlay (over images)</h3>
		<div>
			<AppButton overlay icon="heart">Default</AppButton>
			<AppButton overlay icon="heart" solid>Solid</AppButton>
			<AppButton overlay icon="heart" primary>Primary</AppButton>
			<AppButton overlay icon="heart" primary solid>Primary Solid</AppButton>
			<AppButton overlay icon="heart" trans>Transparent</AppButton>
			<AppButton overlay icon="heart" primary trans>Primary Transparent</AppButton>
		</div>

		<h3>Block Buttons</h3>
		<div>
			<AppButton block>Default</AppButton>
			<AppButton block solid>Solid</AppButton>
			<AppButton block primary>Primary</AppButton>
			<AppButton block primary solid>Primary Solid</AppButton>
			<AppButton block trans>Transparent</AppButton>
			<AppButton block primary trans>Primary Transparent</AppButton>
		</div>

		<h3>Disabled</h3>
		<div>
			<AppButton disabled>Default</AppButton>
			<AppButton disabled solid>Solid</AppButton>
			<AppButton disabled primary>Primary</AppButton>
			<AppButton disabled primary solid>Primary Solid</AppButton>
			<AppButton disabled trans>Transparent</AppButton>
			<AppButton disabled primary trans>Primary Transparent</AppButton>
		</div>
	</section>
</template>
