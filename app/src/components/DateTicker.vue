<template>
    <div class="countdown"></div>
</template>

<script>
   export default{
        name: 'date-ticker',
        mounted() {
            window.simplyCountdown('.countdown', {
                year: 2022, // required
                month: 10, // required
                day: 2, // required
                hours: 14, // Default is 0 [0-23] integer
                minutes: 0, // Default is 0 [0-59] integer
                seconds: 0, // Default is 0 [0-59] integer
                words: { //words displayed into the countdown
                    days: { singular: 'day', plural: 'days' },
                    hours: { singular: 'hour', plural: 'hours' },
                    minutes: { singular: 'minute', plural: 'minutes' },
                    seconds: { singular: 'second', plural: 'seconds' }
                },
                plural: true, //use plurals
                inline: false, //set to true to get an inline basic countdown like : 24 days, 4 hours, 2 minutes, 5 seconds
                inlineClass: 'simply-countdown-inline', //inline css span class in case of inline = true
                // in case of inline set to false
                enableUtc: false, //Use UTC or not - default : false
                onEnd: function() { return; }, //Callback on countdown end, put your own function here
                refresh: 1000, // default refresh every 1s
                sectionClass: 'simply-section', //section css class
                amountClass: 'simply-amount', // amount css class
                wordClass: 'simply-word', // word css class
                zeroPad: false,
                countUp: false
            });
        }
   }
</script>

<style lang="scss">
</style>
