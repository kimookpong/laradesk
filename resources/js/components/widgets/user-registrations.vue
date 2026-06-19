<template>
    <div class="grid grid-cols-1 gap-6">
        <div class="card flex flex-col">
            <div class="card-header">
                <div class="font-semibold text-gray-900">
                    {{ $t('Registered users this year') }}
                </div>
            </div>
            <div class="card-body relative">
                <loading :status="loading"/>
                <line-chart :chart-data="chartData" :height="350" ref="chart"></line-chart>
            </div>
        </div>
    </div>
</template>

<script>
import LineChart from "@/components/charts/line-chart";

export default {
    name: "user-registrations",
    components: {LineChart},
    data() {
        return {
            loading: true,
            chartData: {
                labels: [
                    this.$t('Jan'), this.$t('Feb'), this.$t('Mar'), this.$t('Apr'), this.$t('May'), this.$t('Jun'), this.$t('Jul'), this.$t('Aug'), this.$t('Sept'), this.$t('Oct'), this.$t('Nov'), this.$t('Dec')
                ],
                datasets: [
                    {
                        label: 'Users',
                        backgroundColor: '#2563eb',
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    }
                ],
            }
        }
    },
    computed: {
        datasets() {
            return this.chartData.datasets[0].data
        }
    },
    watch: {
        datasets() {
            this.$refs.chart.update();
        }
    },
    mounted() {
        this.getData();
    },
    methods: {
        getData() {
            const self = this;
            self.loading = true;
            axios.get('api/dashboard/stats/registered-users').then(function (response) {
                self.chartData.datasets[0].data = response.data;
                self.loading = false;
            });
        }
    },
}
</script>
