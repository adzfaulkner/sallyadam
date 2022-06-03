<template>
    <transition name="modal-fade">
        <div :class="className">
            <div class="modal-backdrop"></div>
            <div class="modal">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down">
                    <div class="modal-content">
                        <div class="modal-header">
                            <slot name="header"></slot>
                            <button 
                                type="button" 
                                :class="hideClose ? 'd-none' : 'btn-close'"
                                aria-label="Close"
                                @click="close"
                            ></button>
                        </div>
                        <div class="modal-body">
                            <slot></slot>
                        </div>
                        <div class="modal-footer">
                            <slot name="footer"></slot>
                        </div>
                    </div>
                </div>  
            </div> 
        </div>
    </transition>       
</template>

<script>
  export default {  
    name: "ModalView", 
    props: {
        className: String,
        hideClose: {
          type: Boolean,
          required: false,
        }
    },
    methods: {
      close() {
        this.$emit('close');
      },
    },
  }
</script>