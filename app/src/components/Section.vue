<template>
    <div class="container">
        <h2 class="secondary-color">{{ title }}</h2>
        <slot></slot>
    </div>        
</template>

<script>
  export default {  
    name: 'content-section',
    props: {
        title: String
    }
  }
</script>