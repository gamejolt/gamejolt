<template>
	<section class="section" id="styleguide-buttons">
		<h1 class="section-header">Buttons</h1>

		<h3>Button Types</h3>
		<div>
			<app-button>Default</app-button>
			<app-button solid>Solid</app-button>
			<app-button primary>Primary</app-button>
			<app-button primary solid>Primary Solid</app-button>
			<app-button trans>Transparent</app-button>
		</div>

		<h3>Icons</h3>
		<div>
			<app-button icon="heart">Default</app-button>
			<app-button icon="heart" solid>Solid</app-button>
			<app-button icon="heart" primary>Primary</app-button>
			<app-button icon="heart" primary solid>Primary Solid</app-button>
			<app-button icon="heart" trans>Transparent</app-button>
		</div>

		<h3>Sparse (icon-only)</h3>
		<div>
			<app-button sparse icon="heart" />
			<app-button sparse icon="heart" solid />
			<app-button sparse icon="heart" primary />
			<app-button sparse icon="heart" primary solid />
			<app-button sparse icon="heart" trans />
		</div>

		<h3>Circle (icon-only)</h3>
		<div>
			<app-button circle icon="heart" />
			<app-button circle icon="heart" solid />
			<app-button circle icon="heart" primary />
			<app-button circle icon="heart" primary solid />
			<app-button circle icon="heart" trans />
		</div>

		<h3>Badges</h3>
		<div>
			<app-button badge="42">Default</app-button>
			<app-button badge="42" solid>Solid</app-button>
			<app-button badge="42" primary>Primary</app-button>
			<app-button badge="42" primary solid>Primary Solid</app-button>
			<app-button badge="42" trans>Transparent</app-button>
		</div>

		<h3>Overlay (over images)</h3>
		<div>
			<app-button overlay icon="heart">Default</app-button>
			<app-button overlay icon="heart" solid>Solid</app-button>
			<app-button overlay icon="heart" primary>Primary</app-button>
			<app-button overlay icon="heart" primary solid>Primary Solid</app-button>
			<app-button overlay icon="heart" trans>Transparent</app-button>
		</div>

		<h3>Block Buttons</h3>
		<div>
			<app-button block>Default</app-button>
			<app-button block solid>Solid</app-button>
			<app-button block primary>Primary</app-button>
			<app-button block primary solid>Primary Solid</app-button>
			<app-button block trans>Transparent</app-button>
		</div>

		<h3>Disabled</h3>
		<div>
			<app-button disabled>Default</app-button>
			<app-button disabled solid>Solid</app-button>
			<app-button disabled primary>Primary</app-button>
			<app-button disabled primary solid>Primary Solid</app-button>
			<app-button disabled trans>Transparent</app-button>
		</div>
	</section>
</template>

<script lang="ts" src="./button-styleguide"></script>
