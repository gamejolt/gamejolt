<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
					<h1 class="section-header">
						<translate>dash.games.add.heading</translate>
					</h1>

					<form-game @submit="onSubmit" />
				</div>
			</div>
		</div>
	</section>
</template>

<script lang="ts" src="./add"></script>
