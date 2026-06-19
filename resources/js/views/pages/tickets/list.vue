<template>
    <div class="kanban-page">
        <!-- Header -->
        <header class="kanban-header px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold text-gray-900">{{ $t('My tickets') }}</h2>
                <router-link class="btn btn-blue shadow-sm rounded-md" to="/tickets/new">
                    {{ $t('New ticket') }}
                </router-link>
            </div>

            <!-- Search bar -->
            <div class="mt-3 bg-white rounded-md shadow-sm px-4 py-2 flex items-center">
                <svg-vue class="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" icon="font-awesome.search-regular"></svg-vue>
                <input
                    v-model="search"
                    :placeholder="$t('Search')"
                    class="flex-1 text-sm outline-none border-0"
                    @input="onSearch"
                >
                <span v-if="loading" class="text-xs text-gray-400 ml-2">{{ $t('Loading') }}…</span>
            </div>
        </header>

        <!-- Kanban board -->
        <main class="kanban-main px-4 sm:px-6 lg:px-8 pb-6">
            <div class="kanban-grid">
                <div
                    v-for="column in columns"
                    :key="column.status.id"
                    class="kanban-col"
                >
                    <!-- Column header -->
                    <div :class="statusTheme(column.status.id).header" class="col-header">
                        <div class="flex items-center space-x-2">
                            <span :class="statusTheme(column.status.id).dot" class="status-dot"></span>
                            <span class="font-semibold text-sm tracking-wide">{{ column.status.name }}</span>
                        </div>
                        <span :class="statusTheme(column.status.id).badge" class="count-badge">
                            {{ column.tickets.length }}
                        </span>
                    </div>

                    <!-- Draggable body -->
                    <draggable
                        :list="column.tickets"
                        :group="{ name: 'tickets' }"
                        :animation="150"
                        ghost-class="kanban-ghost"
                        drag-class="kanban-drag"
                        :class="[statusTheme(column.status.id).body, 'col-body']"
                        @change="onChange($event, column)"
                    >
                        <div
                            v-for="ticket in column.tickets"
                            :key="ticket.uuid"
                            :class="[statusTheme(column.status.id).cardBorder, 'kanban-card']"
                            @click="openTicket(ticket)"
                        >
                            <div class="card-top-row">
                                <div class="card-subject">{{ ticket.subject }}</div>
                                <span
                                    v-if="ticket.priority"
                                    :class="priorityClass(ticket.priority.value)"
                                    class="priority-badge"
                                >
                                    {{ ticket.priority.name }}
                                </span>
                            </div>
                            <div v-if="ticket.department" class="card-dept">
                                {{ ticket.department.name }}
                            </div>
                            <div class="card-dates">
                                <div class="card-date-row">
                                    <span class="card-date-label">{{ $t('Created at') }}</span>
                                    <span class="card-date-value">{{ ticket.created_at | momentDate }}</span>
                                </div>
                                <div class="card-date-row">
                                    <span class="card-date-label">{{ $t('Updated at') }}</span>
                                    <span class="card-date-value">{{ ticket.updated_at | momentAgo }}</span>
                                </div>
                            </div>
                        </div>

                        <div v-if="column.tickets.length === 0" slot="footer" class="empty-col">
                            {{ $t('No tickets') }}
                        </div>
                    </draggable>
                </div>
            </div>

            <!-- No data -->
            <div v-if="!loading && columns.length === 0" class="flex items-center justify-center" style="min-height: 400px;">
                <div class="text-center">
                    <svg-vue class="h-40 w-40 mx-auto mb-4" icon="undraw.task-list"></svg-vue>
                    <div class="font-semibold text-xl text-gray-600">{{ $t('No records found') }}</div>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
import draggable from 'vuedraggable';

const STATUS_THEMES = {
    1: {
        header:     'bg-blue-500 text-white',
        body:       'bg-blue-50',
        dot:        'bg-white',
        badge:      'bg-blue-600 text-white',
        cardBorder: 'border-l-4 border-blue-400',
    },
    2: {
        header:     'bg-orange-400 text-white',
        body:       'bg-orange-50',
        dot:        'bg-white',
        badge:      'bg-orange-500 text-white',
        cardBorder: 'border-l-4 border-orange-400',
    },
    3: {
        header:     'bg-green-500 text-white',
        body:       'bg-green-50',
        dot:        'bg-white',
        badge:      'bg-green-600 text-white',
        cardBorder: 'border-l-4 border-green-400',
    },
    4: {
        header:     'bg-gray-500 text-white',
        body:       'bg-gray-100',
        dot:        'bg-white',
        badge:      'bg-gray-600 text-white',
        cardBorder: 'border-l-4 border-gray-400',
    },
};

const DEFAULT_THEME = {
    header:     'bg-indigo-500 text-white',
    body:       'bg-indigo-50',
    dot:        'bg-white',
    badge:      'bg-indigo-600 text-white',
    cardBorder: 'border-l-4 border-indigo-400',
};

export default {
    name: 'TicketKanban',
    components: { draggable },
    metaInfo() {
        return { title: this.$i18n.t('My tickets') };
    },
    filters: {
        momentAgo(value) {
            return moment(value).locale(window.app.app_date_locale).fromNow();
        },
        momentDate(value) {
            return moment(value).locale(window.app.app_date_locale).format(window.app.app_date_format);
        },
    },
    data() {
        return {
            loading: true,
            columns: [],
            search: '',
            searchTimer: null,
        };
    },
    mounted() {
        this.load();
    },
    methods: {
        async load() {
            this.loading = true;
            try {
                const [statusRes, ticketRes] = await Promise.all([
                    axios.get('api/tickets/statuses'),
                    axios.get('api/tickets', { params: { perPage: 500, search: this.search } }),
                ]);
                const statuses = statusRes.data.slice().sort((a, b) => a.id - b.id);
                const tickets  = ticketRes.data.items;
                this.columns = statuses.map(status => ({
                    status,
                    tickets: tickets.filter(t => t.status.id === status.id),
                }));
            } finally {
                this.loading = false;
            }
        },
        onSearch() {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.load(), 400);
        },
        onChange(event, column) {
            if (!event.added) return;
            const ticket = event.added.element;
            axios.patch(`api/tickets/${ticket.uuid}/status`, { status_id: column.status.id })
                .catch(() => this.load());
        },
        openTicket(ticket) {
            this.$router.push('/tickets/' + ticket.uuid);
        },
        statusTheme(id) {
            return STATUS_THEMES[id] || DEFAULT_THEME;
        },
        priorityClass(value) {
            if (value === 1) return 'bg-green-100 text-green-700';
            if (value === 2) return 'bg-blue-100 text-blue-700';
            if (value === 3) return 'bg-orange-100 text-orange-700';
            return 'bg-red-100 text-red-700';
        },
    },
};
</script>

<style scoped>
/* ── Page layout ── */
.kanban-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background-color: #f9fafb;
}

.kanban-header {
    flex-shrink: 0;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
}

.kanban-main {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding-top: 1rem;
}

/* ── Grid ── */
.kanban-grid {
    flex: 1;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
    overflow: hidden;
}

@media (min-width: 640px) {
    .kanban-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
    .kanban-grid { grid-template-columns: repeat(4, 1fr); }
}

/* ── Column ── */
.kanban-col {
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    overflow: hidden;
    min-height: 0;
}

.col-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    flex-shrink: 0;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    opacity: 0.8;
}

.count-badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.1rem 0.5rem;
    border-radius: 9999px;
}

.col-body {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 100px;
}

/* ── Cards ── */
.kanban-card {
    background: #fff;
    border-radius: 0.375rem;
    padding: 0.75rem;
    cursor: pointer;
    user-select: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    transition: box-shadow 0.15s ease, transform 0.1s ease;
}

.kanban-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-1px);
}

.card-top-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.card-subject {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    line-height: 1.4;
    word-break: break-word;
    flex: 1;
    min-width: 0;
}

.card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.25rem;
    flex-wrap: wrap;
}

.card-time {
    font-size: 0.7rem;
    color: #9ca3af;
}

.priority-badge {
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
}

.card-dept {
    font-size: 0.7rem;
    color: #9ca3af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-dates {
    margin-top: 0.5rem;
    border-top: 1px solid #f3f4f6;
    padding-top: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.card-date-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.68rem;
}

.card-date-label {
    color: #9ca3af;
}

.card-date-value {
    color: #6b7280;
    font-weight: 500;
}

/* ── Empty ── */
.empty-col {
    text-align: center;
    font-size: 0.75rem;
    color: #d1d5db;
    padding: 2rem 0;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ── Drag states ── */
.kanban-ghost {
    opacity: 0.35;
    background: #e5e7eb;
    border: 2px dashed #9ca3af !important;
    border-radius: 6px;
    box-shadow: none !important;
}

.kanban-drag {
    transform: rotate(2deg) scale(1.02);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
}
</style>
