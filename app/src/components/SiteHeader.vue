<template>
    <header>
      <div class="overlay"></div>
      <div class="container">
        <div class="col-xs-12">
          <h1>Sally <span>&amp;</span> Adam</h1>
          <h2>Are getting married on<br/>Sunday 2nd October 2022</h2>
          <date-ticker></date-ticker>
          <div class="container">
            <div class="col-xs-12 mt-5">
              <button class="btn btn-primary btn-lg btn-rsvp" @click="rsvpClick"><i class="bi bi-envelope-paper-fill"></i> RSVP Now</button>
            </div>
          </div>
        </div>
      </div>
    </header>
</template>

<script>
  import DateTicker from './DateTicker';
  export default {  
    name: 'site-header',
    components:{
      'date-ticker': DateTicker   
    },
    methods: {
      rsvpClick() {
        this.$emit('rsvp-click');
      },
    },
  }
</script>

<style lang="scss">
</style>