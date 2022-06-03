<template>
  <div id="page">
    <site-header @rsvp-click="showModal('rsvp')"></site-header>
    <section class="section--tree">
      <site-section :title="'The venue'">
        <the-venue></the-venue>
      </site-section>
    </section>
    <section class="section--grey">
      <site-section :title="'Accommodation'">
        <where-to-stay></where-to-stay>
      </site-section>
    </section>
    <section class="section--tree">
      <site-section :title="'The proceedings'">
        <the-proceedings></the-proceedings>
      </site-section>
    </section>
    <section class="section--grey">
      <site-section :title="'Gift registry'">
        <gift-list @registry-click="showModal('registry')"></gift-list>
      </site-section>
    </section>
    <modal-view className="rsvp-form" v-show="isRSVPModalVisible" @close="closeRSVPModal">
      <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSe9Jnk7yxhGZOzsgAz6IPeb1uskp4ZJdrZ2P02VBccIxTmCZw/viewform?embedded=true" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
    </modal-view>
    <registry-modal @close="closeRegistryModal" :isGiftRegistryModalVisible="isGiftRegistryModalVisible" :successPayment="successPayment" :cancelPayment="cancelPayment"></registry-modal>
  </div>
</template>

<script>
  import SiteHeader from './components/SiteHeader';
  import Section from './components/Section.vue';
  import TheVenue from './components/TheVenue.vue';
  import WhereToStay from './components/WhereToStay.vue';
  import TheProceedings from './components/TheProceedings.vue';
  import GiftList from './components/GiftList.vue';
  import ModalView from './components/ModalView.vue';
  import RegistryModal from './components/gift-registry/RegistryModal.vue';

  export default {
    components:{
      'site-header': SiteHeader,
      'site-section': Section,
      'the-venue': TheVenue,
      'where-to-stay': WhereToStay,
      'the-proceedings': TheProceedings,
      'gift-list': GiftList,
      'modal-view': ModalView,
      'registry-modal': RegistryModal,
    },
    data() {
      return {
        isRSVPModalVisible: false,
        isGiftRegistryModalVisible: false,
        isSuccessModalVisible: false,
        successPayment: false,
        cancelPayment: false,
      };
    },
    beforeMount() {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      this.cancelPayment = urlParams.get('cancel') === 'true';
      this.successPayment = urlParams.get('success') === 'true';
    },
    mounted() {
      if (this.cancelPayment || this.successPayment) {
        this.$router.push("/");
        this.showRegistryModal();
      }
    },
    methods: {
      showRSVPModal() {
        this.isRSVPModalVisible = true;
        this.modalOpen();
      },
      closeRSVPModal() {
        this.isRSVPModalVisible = false;
        this.modalClose();
      },
      showRegistryModal() {
        this.isGiftRegistryModalVisible = true;
        this.modalOpen();
      },
      closeRegistryModal() {
        this.isGiftRegistryModalVisible = false;
        this.modalClose();
      },
      modalOpen() {
        document.body.classList.add('modal-open');
      },
      modalClose() {
        document.body.classList.remove('modal-open');
      },
      showModal(modal) {
        switch(modal) {
          case 'rsvp':
            this.showRSVPModal();
            return;
          case 'registry':
            this.showRegistryModal();
            return;
        }
      }
    }
  }
</script>

<style lang="scss">
  @import '@/styles/main';
</style>
