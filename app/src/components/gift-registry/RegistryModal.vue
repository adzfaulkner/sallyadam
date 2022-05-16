<template>
  <modal-view className="registry-form" v-show="isGiftRegistryModalVisible" :hideClose="showModalClose()" @close="close">
       <template v-slot:header>
         <h6 class="modal-title" v-if="showModalTitle()">Welcome {{user.firstname}} {{user.surname}}</h6>
         <span class="ms-3" v-if="showLogoutCTA()">[<a href="javascript://" @click="LogOut">Logout</a>]</span>
         <h5 class="modal-title" v-if="!isAuthenticated">Login</h5>
       </template>
       <template v-slot:default>
          <login-form v-if="!isAuthenticated" @submitted="login" :loginError="loginError" :submitDisabled="submitDisabled"></login-form>
          <registry-list v-if="showRegistryList()" :registryData="registryData" @contribute="contribute" :contributions="contributions"></registry-list>
          <registry-confirmation v-if="showRegistryConfirmation()" :registryData="registryData" :registryDataMap="registryDataMap" :contributions="contributions" :messageInput="message" :willPayFee="willPayFee" @payFee="payFee" @messageAdded="messageAdded" @changes="lastStep"></registry-confirmation>
          <div v-if="showRedirectWait()" class="d-flex align-items-center">
            <strong>Hang tight we will be redirecting you to Stripe payments shortly...</strong>
            <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
          </div>
          <div v-if="showPaymentSuccess()">
            <h1 class="secondary-color mb-3">Many thanks for your contribution</h1>
            <p>Be rest assured, we will put the funds towards the activities you contributed towards.</p>
            <p>We look forward to seeing you on our big day!</p>
            <p>Adam & Sally</p>
            <button type="button" class="btn btn-primary" @click="registryReset">Back to registry list</button>
          </div>
       </template>
       <template v-slot:footer>
         <form v-if="showModalFooter()" @submit.prevent="submit">
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
  import { COMPONENT_CONFIRMATION, COMPONENT_SUCCESS, COMPONENT_LIST, COMPONENT_REDIRECT_WAIT } from "@/store/modules/registry";

  export default {
    name: "RegistryModal",
    mounted() {
      if (this.successPayment) {
        this.$store.dispatch('SuccessfulPayment');
        return;
      }

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
      cancelPayment: Boolean,
      successPayment: Boolean,
    },
    computed: {
      ...mapGetters({
        user: "StateUser", 
        isAuthenticated: "isAuthenticated",
        loginError: "LoginError",
        contributionTotal: "ContributionTotal",
        hasContributions: "HasContributions",
        contributions: "Contributions",
        message: "Message",
        willPayFee: "PayFee",
        renderComponent: "RenderComponent",
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
        "ResetRegistry",
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
      async registryReset() {
        await this.ResetRegistry();
      },
      close() {
        this.$emit('close');
        this.$el.querySelector('.modal-body').scrollTo(0, 0);
      },
      showModalTitle() {
        return this.isAuthenticated && [COMPONENT_REDIRECT_WAIT, COMPONENT_SUCCESS].indexOf(this.renderComponent) < 0;
      },
      showModalFooter() {
        return this.isAuthenticated && [COMPONENT_REDIRECT_WAIT, COMPONENT_SUCCESS].indexOf(this.renderComponent) < 0;
      },
      showLogoutCTA() {
        return this.isAuthenticated && [COMPONENT_REDIRECT_WAIT, COMPONENT_SUCCESS].indexOf(this.renderComponent) < 0;
      },
      showModalClose() {
        return this.renderComponent === COMPONENT_REDIRECT_WAIT;
      },
      showRegistryList() {
        return this.isAuthenticated && this.renderComponent === COMPONENT_LIST;
      },
      showRegistryConfirmation() {
        return this.isAuthenticated && this.renderComponent === COMPONENT_CONFIRMATION;
      },
      showRedirectWait() {
        return this.isAuthenticated && this.renderComponent === COMPONENT_REDIRECT_WAIT;
      },
      showPaymentSuccess() {
        return this.isAuthenticated && this.renderComponent === COMPONENT_SUCCESS;
      },
    }
  }
</script>