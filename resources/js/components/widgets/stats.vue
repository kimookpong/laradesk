<template>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div
            v-for="card in cards"
            :key="card.key"
            class="card card-hover relative overflow-hidden"
        >
            <loading :status="stats[card.key] == null"/>
            <span :class="card.accent" class="absolute inset-y-0 left-0 w-1"></span>
            <div class="px-5 py-5 sm:px-6">
                <dt class="text-sm font-medium text-gray-500 truncate">
                    {{ card.label }}
                </dt>
                <dd class="mt-1 text-3xl font-semibold text-gray-900">
                    {{ stats[card.key] ? stats[card.key] : 0 }}
                </dd>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "stats",
    data() {
        return {
            stats: {
                open_tickets: null,
                pending_tickets: null,
                solved_tickets: null,
                without_agent: null,
            }
        }
    },
    computed: {
        cards() {
            return [
                {key: 'open_tickets', label: this.$t('Open tickets'), accent: 'bg-primary-500'},
                {key: 'pending_tickets', label: this.$t('Pending tickets'), accent: 'bg-yellow-400'},
                {key: 'solved_tickets', label: this.$t('Solved tickets'), accent: 'bg-green-500'},
                {key: 'without_agent', label: this.$t('Without assign agent'), accent: 'bg-red-500'},
            ];
        }
    },
    mounted() {
        this.getData();
    },
    methods: {
        getData() {
            const self = this;
            axios.get('api/dashboard/stats/count').then(function (response) {
                self.stats = response.data;
            });
        }
    },
}
</script>
