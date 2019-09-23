<template>
	<section class="section">
		<app-page-container no-left order="right,main">
			<div slot="right">
				<h3><translate>What are Communities?</translate></h3>
				<p>
					<translate>
						Communities are a magical place where people of similar interest gather to post and
						comment about stuff. Can't find a community for that game you like? Good news, now you
						can make one!
					</translate>
				</p>

				<h3><translate>This is Beta</translate></h3>
				<p>
					<translate>
						Communities are new. Things may change around a lot in the near future that may impact
						how they work and how you manage them. Keep an eye out for updates on our devlog!
					</translate>
					<br />
					<a href="https://gamejolt.com/games/gj/272864">
						<translate>Here's a link to it</translate>
					</a>
				</p>
			</div>

			<h2>
				<translate>Create Your Community</translate>
				<br />
				<small><translate>the best place to commune.</translate></small>
			</h2>
			<form-community @submit="onSubmit" />
		</app-page-container>
	</section>
</template>

<script lang="ts" src="./add"></script>
