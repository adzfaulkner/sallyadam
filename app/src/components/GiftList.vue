<template>
    <div class="row">
        <div class="col-12">
          <div class="container">
            <div class="row mb-4">
              <div class="col-12 col-md-4"><img src="@/assets/img/ski_2.jpg" class="img-fluid" alt="We are heading to Banff!!" /></div>
              <div class="col-12 col-md-8 mt-3 mt-md-0">
                <div class="row">
                  <div class="col-12">
                    We would be absolutely delighted if our guests would contribute to our honeymoon via the Gift Registry that can be accessed by clicking the button below.
                  </div>
                  <div class="col-12 mt-4">
                    <div class="text-center alert alert-warning fw-bold text-uppercase taviraj-font-family" role="alert">
                      Guest passwords will be sent out via email in due course.
                    </div>
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