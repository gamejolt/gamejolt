<template>
	<section class="section">
		<div class="container">
			<div class="row">
				<div class="col-sm-10 col-md-8 col-lg-7 col-centered">
					<h1 class="section-header">
						<translate>Create a Community</translate>
						<br />
						<small>the best place to commune.</small>
					</h1>

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

					<h3><translate>Moderating</translate></h3>
					<p>
						<translate>
							Making a community is not a fire and forget kind of deal. As the community creator,
							it's your role to moderate and cultivate it. So long as you don't break our rules you
							can manage the community as you see fit!
						</translate>
					</p>

					<h3><translate>Your Community</translate></h3>
					<form-community @submit="onSubmit" />
				</div>
			</div>
		</div>
	</section>
</template>

<script lang="ts" src="./add"></script>
