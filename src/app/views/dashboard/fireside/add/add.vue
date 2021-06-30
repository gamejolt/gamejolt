<script lang="ts" src="./add"></script>

<template>
	<section class="section">
		<app-page-container no-left no-right>
			<template #default>
				<h2>
					<small>
						<translate> Stoke the Flames </translate>
					</small>
					<br />
					<translate>Start your Fireside</translate>
				</h2>

				<form-fireside-add @submit="onSubmit" />
			</template>
		</app-page-container>
	</section>
</template>
