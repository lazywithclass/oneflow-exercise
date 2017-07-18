<template>
  <div class="container">
    <div class="row">
      <div class="col-lg-6 col-lg-offset-3">
        <input type="text" v-model="filterText" class="form-control" placeholder="filter by name" />
      </div>
    </div>

    <div class="row">
      <div class="col-lg-5 col-lg-offset-5">
        <div class="input-group">
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-3" v-for="album in filteredAlbums">
        <h3>{{album.name}}</h3>
        <a :href="album.external_urls.spotify"><img :src="album.image" /></a>
      </div>
    </div>
    <hr>
    <footer>
      <small>Lots of thanks to all the beautiful guides on <a href="https://vuejs.org/">Vue.js</a></small>
    </footer>
  </div>
</template>

<style>
 body {
   font-family: "Fira Sans","Trebuchet MS","Helvetica Neue","Arial",sans-serif;
   background-color: #f3f3f3;
 }

 img {
   max-width:100%;
   max-height:100%;
 }

 .container {
   margin-top: 20px;
 }

 .row > .col-md-3 {
   margin-top: 10px;
   padding-bottom: 10px;
 }

 .row > .col-md-3:hover {
   background-color: #e3e3e3;
 }
</style>

<script>
export default {
  data() {
    this.$http.get('http://localhost:3000/api/albums/1vCWHaC5f2uS3yhpwWbIA6').then((data) => {
      this.albums = this.filteredAlbums = data.body.items.map(album => {
        album.image = album.images[0].url
        return album
      })
    })
    return {
      filterText: '',
      filteredAlbums: this.albums
    }
  },
  watch: {
    filterText: function() {
      this.filteredAlbums = this.albums.filter(album => {
        return album.name.toLowerCase().indexOf(this.filterText.toLowerCase()) > -1;
      })
    }
  }
}
</script>
