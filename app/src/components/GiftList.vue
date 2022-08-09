<template>
    <div class="row">
        <div class="col-12">
          <div class="container">
            <div class="row mb-4">
              <div class="col-12 col-md-4"><img src="@/assets/img/ski_2.jpg" class="img-fluid" alt="We are heading to Banff!!" /></div>
              <div class="col-12 col-md-8 mt-3 mt-md-0">
                <div class="row">
                  <div class="col-12">
                    Whilst your presence is the best gift we could ask for, we know some of you may like to provide a gift.  memories to us are the perfect present and as such a contribution to our honeymoon would be greatly appreciated.<br/><br/>
                    To find out where our honeymoon is and the activities planned, click on the button below and enter the guest password sent to you via email.
                  </div>
                  <div class="col-12 text-center mt-4">
                    <button class="btn btn-primary btn-lg btn-rsvp" @click="registryClick"><i class="bi bi-gift-fill"></i> Open the Gift Registry</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>   
    </div>
</template>

<script>
  export default {  
    props: {
      modalHandler: String,
    },
    methods: {
      registryClick() {
        this.$emit('registry-click');
      },
    },
  }
</script>