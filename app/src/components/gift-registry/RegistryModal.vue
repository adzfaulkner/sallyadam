<template>
  <modal-view className="registry-form" v-show="isGiftRegistryModalVisible" :hideClose="onStepThree" @close="close">
       <template v-slot:header>
         <h6 class="modal-title" v-if="isAuthenticated && !onStepThree">Welcome {{user.firstname}} {{user.surname}}</h6>
         <span class="ms-3" v-if="isAuthenticated && !onStepThree">[<a href="javascript://" @click="LogOut">Logout</a>]</span>
         <h5 class="modal-title" v-if="!isAuthenticated">Login</h5>
       </template>
       <template v-slot:default>
          <login-form v-if="!isAuthenticated" @submitted="login" :loginError="loginError" :submitDisabled="submitDisabled"></login-form>
          <registry-list v-if="isAuthenticated && onStepOne" :registryData="registryData" @contribute="contribute" :contributions="contributions"></registry-list>
          <registry-confirmation v-if="isAuthenticated && onStepTwo" :registryData="registryData" :registryDataMap="registryDataMap" :contributions="contributions" :messageInput="message" :willPayFee="willPayFee" @payFee="payFee" @messageAdded="messageAdded" @changes="lastStep"></registry-confirmation>
          <div v-if="isAuthenticated && onStepThree" class="d-flex align-items-center">
            <strong>Hang tight we will be redirecting you to Stripe payments shortly...</strong>
            <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
          </div>
       </template>
       <template v-slot:footer>
         <form v-if="isAuthenticated && !onStepThree" @submit.prevent="submit">
            <label class="me-3 col-form-label">Total: £<span>{{contributionTotal}}</span></label> 
            <button type="button" class="btn btn-primary" :disabled="!hasContributions" @click="nextStep">Proceed</button>
         </form>
       </template>
  </modal-view>
</template>
<script>
  import ModalView from '../ModalView.vue';
  import LoginForm from './LoginForm.vue';
  import RegistryConfirmation from './RegistryConfirmation.vue';
  import RegistryList from './RegistryList.vue';
  import { mapActions, mapGetters } from "vuex";
  
  export default {
    name: "RegistryModal",
    mounted() {
      this.$store.dispatch('Verify');
    },
    data() {
      return {
        submitDisabled: false,
      }
    },
    props:{
      isGiftRegistryModalVisible: Boolean,
      registryData: Array,
      registryDataMap: Object,
    },
    computed: {
      ...mapGetters({
        user: "StateUser", 
        isAuthenticated: "isAuthenticated",
        loginError: "LoginError",
        contributionTotal: "ContributionTotal",
        hasContributions: "HasContributions",
        contributions: "Contributions",
        onStepOne: "OnStepOne",
        onStepTwo: "OnStepTwo",
        onStepThree: "OnStepThree",
        message: "Message",
        willPayFee: "PayFee",
      }),
    },
    components:{
      'modal-view': ModalView,
      'login-form': LoginForm,
      'registry-confirmation': RegistryConfirmation,
      'registry-list': RegistryList,
    },
    methods: {
      ...mapActions([
        "LogOut",
        "LogIn", 
        "AddContribution",
        "NextStep", 
        "PayFee", 
        "MessageAdded", 
        "LastStep",
        "Verify",
      ]),
      async login(username, password) {
          this.submitDisabled = true;
          this.$forceUpdate();

          await this.LogIn({username, password});
          this.submitDisabled = false;
      },
      async contribute(uuid, amount) {
        await this.AddContribution({
          uuid,
          amount
        });
      },
      async nextStep() {
        await this.NextStep();
        this.$el.querySelector('.modal-body').scrollTo(0, 0);
      },
      async payFee(decision) {
        await this.PayFee(decision);
      },
      async messageAdded(message) {
        await this.MessageAdded(message);
      },
      async lastStep() {
        await this.LastStep();
        this.$el.querySelector('.modal-body').scrollTo(0, 0);
      },
      close() {
        this.$emit('close');
        this.$el.querySelector('.modal-body').scrollTo(0, 0);
      }
    }
  }
</script>