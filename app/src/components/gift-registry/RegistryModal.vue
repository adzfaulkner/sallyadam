<template>
  <modal-view className="registry-form" v-show="isGiftRegistryModalVisible" :hideClose="showModalClose()" @close="close">
       <template v-slot:header>
         <h6 class="modal-title" v-if="showModalTitle()">Welcome Guest</h6>
         <span class="ms-3" v-if="showLogoutCTA()">[<a href="javascript://" @click="LogOut">Logout</a>]</span>
         <h5 class="modal-title" v-if="!isAuthenticated">Login</h5>
       </template>
       <template v-slot:default>
          <login-form v-if="!isAuthenticated" @submitted="login" :loginError="loginError" :submitDisabled="submitDisabled"></login-form>
          <registry-list v-if="showRegistryList()" :stepOne="stepOne" :errors="registryErrors" @contribute="contribute"></registry-list>
          <registry-confirmation v-if="showRegistryConfirmation()" :stepTwo="stepTwo" :errors="registryErrors" :messageCharLimit="messageCharLimit" @payFee="payFee" @messageAdded="messageAdded" @emailAdded="emailAdded" @changes="lastStep"></registry-confirmation>
          <div v-if="showRedirectWait()" class="text-center">
            <h5>Please Hang tight</h5>
            <p>We will be redirecting you to the checkout in a jiffy ...</p>
            <div class="spinner-border mt-5" style="width:5rem; height:5rem;" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-if="showPaymentSuccess()" class="col-12">
            <h1 class="secondary-color text-center">Many thanks for your contribution</h1>
            <img src="@/assets/img/ski_1.jpg" class="img-fluid mt-4" alt="Many thanks!!" />
            <div class="mt-4">
              <p>Rest assured, we will put the funds towards the activities you contributed towards.</p>
              <p>We look forward to seeing you on our big day!</p>
              <p>Adam & Sally</p>
            </div>
            <button type="button" class="btn btn-primary mt-3" @click="registryReset">Back to registry list</button>
          </div>
       </template>
       <template v-slot:footer>
         <form v-if="showModalFooter()" @submit.prevent="submit">
            <label class="me-3 col-form-label">Total: £<span :class="{ 'total-updated': animateTotal }">{{contributionTotal}}</span></label>
            <button type="button" class="btn btn-primary" :disabled="!hasContributions || hasRegistryErrors" @click="nextStep">Proceed</button>
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
  import regData from '../../assets/registry.json';

  export default {
    name: "RegistryModal",
    beforeCreate() {
      try {
        const registryItems = regData.registry;

        this.$store.dispatch('InitRegistry', {
          registryItems
        });

        if (this.successPayment) {
          this.$store.dispatch('SuccessfulPayment');
          return;
        }

        this.$store.dispatch('Verify');
      } catch(e) {
        console.log(e);
      }
    },
    data() {
      return {
        submitDisabled: false,
        animateTotal: false,
      }
    },
    props:{
      isGiftRegistryModalVisible: Boolean,
      cancelPayment: Boolean,
      successPayment: Boolean,
    },
    computed: {
      ...mapGetters({
        isAuthenticated: "isAuthenticated",
        loginError: "LoginError",
        contributionTotal: "ContributionTotal",
        hasContributions: "HasContributions",
        contributions: "Contributions",
        message: "Message",
        email: "Email",
        willPayFee: "PayFee",
        renderComponent: "RenderComponent",
        registryItems: "RegistryItems",
        registryItemsMap: "RegistryItemsMap",
        stepOne: "StepOne",
        stepTwo: "StepTwo",
        registryErrors: "RegistryErrors",
        messageCharLimit: "MessageCharLimit",
        hasRegistryErrors: "HasErrors",
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
        "EmailAdded",
        "LastStep",
        "Verify",
        "ResetRegistry",
        "InitRegistry",
      ]),
      async login(password) {
          this.submitDisabled = true;
          this.$forceUpdate();

          await this.LogIn({password});
          this.submitDisabled = false;
      },
      async contribute(uuid, amount) {
        this.animateTotal = true;
        await this.AddContribution({
          uuid,
          amount
        });
        setTimeout(() => {
          this.animateTotal = false;
        }, 1000);
      },
      async nextStep() {
        await this.NextStep();
        this.$el.querySelector('.modal-body').scrollTo(0, 0);
      },
      async payFee(decision) {
        this.animateTotal = true;
        await this.PayFee(decision);
        setTimeout(async () => {
          this.animateTotal = false;
        }, 1000);
      },
      async messageAdded(message) {
        await this.MessageAdded(message);
      },
      async emailAdded(email) {
        await this.EmailAdded(email);
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