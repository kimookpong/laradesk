<template>
    <div class="dash-kanban-page">

        <!-- ── Header ── -->
        <div class="dash-kanban-header bg-white border-b border-gray-200 px-5 sm:px-6 lg:px-8 py-4">
            <div class="flex items-center justify-between flex-wrap gap-3">
                <h1 class="text-2xl font-semibold text-gray-900">{{ $t('Tickets') }}</h1>
                <div class="flex items-center gap-2">
                    <!-- Search inline -->
                    <div class="relative hidden sm:block">
                        <svg-vue class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" icon="font-awesome.search-regular"></svg-vue>
                        <input
                            v-model="filters.search"
                            :placeholder="$t('Search')"
                            class="form-input pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md w-48"
                            @input="onSearch"
                        >
                    </div>
                    <!-- Bulk select toggle -->
                    <button
                        :class="selectMode ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-gray-300 text-gray-700 bg-white hover:text-primary-600 hover:border-primary-300'"
                        class="inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium focus:outline-none transition ease-in-out duration-150"
                        type="button"
                        @click="toggleSelectMode"
                    >
                        {{ selectMode ? $t('Cancel') : $t('Select') }}
                    </button>
                    <!-- Filters sidebar trigger -->
                    <button
                        class="inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:text-primary-600 hover:border-primary-300 focus:outline-none transition ease-in-out duration-150"
                        type="button"
                        @click="openFiltersSidebar"
                    >
                        <svg-vue class="mr-2 h-4 w-4" icon="font-awesome.filter-regular"></svg-vue>
                        {{ $t('Filters') }}
                        <span v-if="activeFiltersCount > 0" class="ml-1 bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5">{{ activeFiltersCount }}</span>
                    </button>
                    <!-- Refresh -->
                    <button
                        class="rounded-lg border border-gray-300 px-3 py-2 bg-white text-sm text-gray-700 hover:text-primary-600 hover:border-primary-300 focus:outline-none transition ease-in-out duration-150"
                        type="button"
                        @click="load"
                    >
                        <svg-vue class="w-4 h-4" icon="font-awesome.sync-regular"></svg-vue>
                    </button>
                    <router-link class="btn btn-primary shadow-sm rounded-lg" to="/dashboard/tickets/new">
                        {{ $t('Create ticket') }}
                    </router-link>
                </div>
            </div>
            <span v-if="loading" class="text-xs text-gray-400 mt-1 block">{{ $t('Loading') }}…</span>
        </div>

        <!-- ── Bulk action bar (visible when items are selected) ── -->
        <transition
            enter-active-class="transition ease-out duration-200"
            enter-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
        >
            <div v-if="selectMode && selectedIds.length > 0" class="bulk-action-bar">
                <span class="text-sm font-medium text-gray-700 whitespace-no-wrap">{{ selectedIds.length }} {{ $t('selected') }}</span>
                <select class="bulk-select" @change="bulkAction('status', $event.target.value); $event.target.value = ''">
                    <option value="">{{ $t('Status') }}</option>
                    <option v-for="s in statusList" :key="'s'+s.id" :value="s.id">{{ s.name }}</option>
                </select>
                <select class="bulk-select" @change="bulkAction('priority', $event.target.value); $event.target.value = ''">
                    <option value="">{{ $t('Priority') }}</option>
                    <option v-for="p in priorityList" :key="'p'+p.id" :value="p.id">{{ p.name }}</option>
                </select>
                <select class="bulk-select" @change="bulkAction('agent', $event.target.value); $event.target.value = ''">
                    <option value="">{{ $t('Agent') }}</option>
                    <option v-for="a in agentList" :key="'a'+a.id" :value="a.id">{{ a.name }}</option>
                </select>
                <select class="bulk-select" @change="bulkAction('department', $event.target.value); $event.target.value = ''">
                    <option value="">{{ $t('Department') }}</option>
                    <option v-for="d in departmentList" :key="'d'+d.id" :value="d.id">{{ d.name }}</option>
                </select>
                <button class="btn btn-red btn-sm rounded-lg" type="button" @click="bulkDelete">{{ $t('Delete') }}</button>
                <button class="text-sm text-gray-500 hover:text-gray-700 px-2" type="button" @click="clearSelection">{{ $t('Clear') }}</button>
            </div>
        </transition>

        <!-- ── Kanban Board ── -->
        <div class="dash-kanban-main px-4 sm:px-6 lg:px-8 py-4">
            <div class="dash-kanban-grid">
                <div
                    v-for="column in columns"
                    :key="column.status.id"
                    class="dash-kanban-col"
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
                        :disabled="selectMode"
                        ghost-class="kanban-ghost"
                        drag-class="kanban-drag"
                        :class="[statusTheme(column.status.id).body, 'col-body']"
                        @change="onChange($event, column)"
                    >
                        <!-- Ticket card -->
                        <div
                            v-for="ticket in column.tickets"
                            :key="ticket.uuid"
                            :class="[statusTheme(column.status.id).cardBorder, 'kanban-card', {'kanban-card--selected': isSelected(ticket), 'kanban-card--pick': selectMode}]"
                            @click="onCardClick(ticket)"
                        >
                            <span v-if="selectMode" class="bulk-check" :class="{'bulk-check--on': isSelected(ticket)}"></span>
                            <!-- Top row: customer + priority -->
                            <div class="card-top-row">
                                <div class="card-customer">
                                    <img
                                        :src="ticket.user.avatar !== 'gravatar' ? ticket.user.avatar : ticket.user.gravatar"
                                        :alt="ticket.user.name"
                                        class="card-avatar"
                                    >
                                    <span class="card-customer-name">{{ ticket.user.name }}</span>
                                </div>
                                <span
                                    v-if="ticket.priority"
                                    :class="priorityClass(ticket.priority.value)"
                                    class="priority-badge"
                                >
                                    {{ ticket.priority.name }}
                                </span>
                            </div>

                            <!-- Subject -->
                            <div class="card-subject">{{ ticket.subject }}</div>

                            <!-- Department -->
                            <div v-if="ticket.department" class="card-dept">
                                <svg-vue class="card-dept-icon" icon="font-awesome.users-class-regular"></svg-vue>
                                <span class="truncate">{{ ticket.department.name }}</span>
                            </div>

                            <!-- Labels -->
                            <div v-if="ticket.labels && ticket.labels.length > 0" class="card-labels">
                                <span
                                    v-for="label in ticket.labels"
                                    :key="label.id"
                                    :style="{ backgroundColor: label.color }"
                                    class="card-label"
                                >
                                    {{ label.name }}
                                </span>
                            </div>

                            <!-- Footer -->
                            <div class="card-footer">
                                <div class="card-footer-left">
                                    <span v-if="ticket.agent" class="card-agent">
                                        <img
                                            :src="ticket.agent.avatar !== 'gravatar' ? ticket.agent.avatar : ticket.agent.gravatar"
                                            :alt="ticket.agent.name"
                                            :title="ticket.agent.name"
                                            class="agent-avatar"
                                        >
                                    </span>
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
                        </div>

                        <!-- Empty column -->
                        <div v-if="column.tickets.length === 0" slot="footer" class="empty-col">
                            {{ $t('No tickets') }}
                        </div>
                    </draggable>
                </div>
            </div>

            <!-- No data -->
            <div v-if="!loading && columns.length === 0" class="flex items-center justify-center" style="min-height: 300px;">
                <div class="text-center">
                    <svg-vue class="h-40 w-40 mx-auto mb-4" icon="undraw.task-list"></svg-vue>
                    <div class="font-semibold text-xl text-gray-600">{{ $t('No records found') }}</div>
                    <div v-if="activeFiltersCount > 0" class="text-sm text-gray-400 mt-1">
                        {{ $t('Try changing the filters, or rephrasing your search') }}.
                    </div>
                </div>
            </div>
        </div>

        <!-- ── Filters sidebar ── -->
        <div v-show="filtersSidebar" class="fixed inset-0 overflow-hidden z-30">
            <div class="absolute inset-0 overflow-hidden">
                <section v-on-clickaway="closeFiltersSidebar" :style="{top: '65px'}" class="absolute inset-y-0 right-0 pl-10 max-w-full flex">
                    <transition
                        duration="500"
                        enter-active-class="transform transition ease-in-out duration-500"
                        enter-class="translate-x-full"
                        enter-to-class="translate-x-0"
                        leave-active-class="transform transition ease-in-out duration-500"
                        leave-class="translate-x-0"
                        leave-to-class="translate-x-full"
                    >
                        <div v-show="filtersSidebar" class="w-screen max-w-xs">
                            <div class="h-full flex flex-col bg-white shadow-xl">
                                <header class="px-4 pt-4 sm:px-6 border-b pb-4">
                                    <div class="flex items-center justify-between">
                                        <h2 class="text-lg font-medium text-gray-900">{{ $t('Filters') }}</h2>
                                        <button class="text-gray-400 hover:text-gray-500" type="button" @click="closeFiltersSidebar">
                                            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                                            </svg>
                                        </button>
                                    </div>
                                </header>
                                <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
                                    <!-- Search (mobile) -->
                                    <div class="sm:hidden">
                                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('Search') }}</label>
                                        <div class="relative">
                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg-vue class="h-4 w-4 text-gray-400" icon="font-awesome.search-regular"></svg-vue>
                                            </div>
                                            <input
                                                v-model="filters.search"
                                                :placeholder="$t('Search')"
                                                class="form-input block w-full pl-10 text-sm"
                                                @input="onSearch"
                                            >
                                        </div>
                                    </div>
                                    <!-- Customer -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('Customer') }}</label>
                                        <div class="relative">
                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg-vue class="h-4 w-4 text-gray-400" icon="font-awesome.users-regular"></svg-vue>
                                            </div>
                                            <input
                                                v-model="filters.user"
                                                :placeholder="$t('User')"
                                                class="form-input block w-full pl-10 text-sm"
                                                @input="onSearch"
                                            >
                                        </div>
                                    </div>
                                    <!-- Agents -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('Agents') }}</label>
                                        <input-select
                                            v-model="filters.agents"
                                            :options="agentList"
                                            multiple
                                            option-label="name"
                                            @change="load"
                                        >
                                            <template v-slot:selectOption="props">
                                                <div class="flex items-center space-x-2">
                                                    <img :src="props.option.avatar !== 'gravatar' ? props.option.avatar : props.option.gravatar" class="w-5 h-5 rounded-full">
                                                    <span :class="filters.agents.indexOf(props.option.id) > -1 ? 'font-semibold' : 'font-normal'">{{ props.option.name }}</span>
                                                </div>
                                            </template>
                                        </input-select>
                                    </div>
                                    <!-- Departments -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('Departments') }}</label>
                                        <input-select
                                            v-model="filters.departments"
                                            :options="departmentList"
                                            multiple
                                            option-label="name"
                                            @change="load"
                                        />
                                    </div>
                                    <!-- Labels -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('Labels') }}</label>
                                        <input-select
                                            v-model="filters.labels"
                                            :options="labelList"
                                            multiple
                                            option-label="name"
                                            @change="load"
                                        >
                                            <template v-slot:selectOption="props">
                                                <div class="flex items-center space-x-2">
                                                    <svg-vue :style="{color: props.option.color}" class="h-4 w-4" icon="font-awesome.circle-solid"></svg-vue>
                                                    <span :class="filters.labels.indexOf(props.option.id) > -1 ? 'font-semibold' : 'font-normal'">{{ props.option.name }}</span>
                                                </div>
                                            </template>
                                        </input-select>
                                    </div>
                                    <!-- Priorities -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('Priorities') }}</label>
                                        <input-select
                                            v-model="filters.priorities"
                                            :options="priorityList"
                                            multiple
                                            option-label="name"
                                            @change="load"
                                        />
                                    </div>
                                    <!-- Reset -->
                                    <button
                                        v-if="activeFiltersCount > 0"
                                        class="w-full text-sm text-red-500 hover:text-red-700 py-2 border border-red-200 rounded-lg"
                                        type="button"
                                        @click="resetFilters"
                                    >
                                        {{ $t('Reset filters') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </transition>
                </section>
            </div>
        </div>
    </div>
</template>

<script>
import draggable from 'vuedraggable';
import {mixin as clickaway} from 'vue-clickaway';

const STATUS_THEMES = {
    1: { // Open — pink
        header:     'bg-pink-500 text-white',
        body:       'bg-pink-100',
        dot:        'bg-white',
        badge:      'bg-pink-600 text-white',
        cardBorder: 'border-l-4 border-pink-400',
    },
    2: { // Pending — yellow
        header:     'bg-yellow-500 text-white',
        body:       'bg-yellow-100',
        dot:        'bg-white',
        badge:      'bg-yellow-600 text-white',
        cardBorder: 'border-l-4 border-yellow-400',
    },
    3: { // Resolved — orange
        header:     'bg-orange-500 text-white',
        body:       'bg-orange-100',
        dot:        'bg-white',
        badge:      'bg-orange-600 text-white',
        cardBorder: 'border-l-4 border-orange-400',
    },
    4: { // Closed — green
        header:     'bg-green-500 text-white',
        body:       'bg-green-100',
        dot:        'bg-white',
        badge:      'bg-green-600 text-white',
        cardBorder: 'border-l-4 border-green-400',
    },
};

const DEFAULT_THEME = {
    header:     'bg-indigo-500 text-white',
    body:       'bg-indigo-100',
    dot:        'bg-white',
    badge:      'bg-indigo-600 text-white',
    cardBorder: 'border-l-4 border-indigo-400',
};

export default {
    name: 'DashboardTicketKanban',
    components: { draggable },
    mixins: [clickaway],
    metaInfo() {
        return { title: this.$i18n.t('Tickets') };
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
            filtersSidebar: false,
            columns: [],
            agentList: [],
            departmentList: [],
            labelList: [],
            priorityList: [],
            filters: {
                search: '',
                user: '',
                agents: [],
                departments: [],
                labels: [],
                priorities: [],
            },
            searchTimer: null,
            selectMode: false,
            selectedIds: [],
        };
    },
    computed: {
        activeFiltersCount() {
            return (this.filters.search ? 1 : 0)
                + (this.filters.user ? 1 : 0)
                + this.filters.agents.length
                + this.filters.departments.length
                + this.filters.labels.length
                + this.filters.priorities.length;
        },
        statusList() {
            return this.columns.map(column => column.status);
        },
    },
    mounted() {
        this.getFilters();
        this.load();
    },
    methods: {
        async load() {
            this.loading = true;
            try {
                const [filtersRes, ticketsRes] = await Promise.all([
                    this.columns.length === 0
                        ? axios.get('api/dashboard/tickets/filters')
                        : Promise.resolve(null),
                    axios.get('api/dashboard/tickets', {
                        params: {
                            perPage: 500,
                            sort: JSON.stringify({ order: 'desc', column: 'updated_at' }),
                            search: this.filters.search,
                            user: this.filters.user,
                            agents: this.filters.agents,
                            departments: this.filters.departments,
                            labels: this.filters.labels,
                            priorities: this.filters.priorities,
                        },
                    }),
                ]);

                if (filtersRes) {
                    this.agentList      = filtersRes.data.agents;
                    this.departmentList = filtersRes.data.departments;
                    this.labelList      = filtersRes.data.labels;
                    this.priorityList   = filtersRes.data.priorities;
                    const statuses = filtersRes.data.statuses.slice().sort((a, b) => a.id - b.id);
                    const tickets  = ticketsRes.data.items;
                    this.columns = statuses.map(status => ({
                        status,
                        tickets: tickets.filter(t => t.status && t.status.id === status.id),
                    }));
                } else {
                    const tickets = ticketsRes.data.items;
                    this.columns.forEach(col => {
                        col.tickets = tickets.filter(t => t.status && t.status.id === col.status.id);
                    });
                }
            } finally {
                this.loading = false;
            }
        },
        getFilters() {
            const self = this;
            axios.get('api/dashboard/tickets/filters').then(function (response) {
                self.agentList      = response.data.agents;
                self.departmentList = response.data.departments;
                self.labelList      = response.data.labels;
                self.priorityList   = response.data.priorities;
            });
        },
        onSearch() {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.load(), 400);
        },
        resetFilters() {
            this.filters = { search: '', user: '', agents: [], departments: [], labels: [], priorities: [] };
            this.load();
        },
        onChange(event, column) {
            if (!event.added) return;
            const ticket = event.added.element;
            axios.post(`api/dashboard/tickets/${ticket.uuid}/quick-actions`, {
                action: 'status',
                value: column.status.id,
            }).catch(() => this.load());
        },
        openTicket(ticket) {
            this.$router.push('/dashboard/tickets/' + ticket.uuid + '/manage');
        },
        // --- Bulk selection -----------------------------------------------------
        onCardClick(ticket) {
            if (this.selectMode) {
                this.toggleSelect(ticket);
            } else {
                this.openTicket(ticket);
            }
        },
        toggleSelectMode() {
            this.selectMode = !this.selectMode;
            if (!this.selectMode) {
                this.clearSelection();
            }
        },
        isSelected(ticket) {
            return this.selectedIds.indexOf(ticket.id) > -1;
        },
        toggleSelect(ticket) {
            const index = this.selectedIds.indexOf(ticket.id);
            if (index > -1) {
                this.selectedIds.splice(index, 1);
            } else {
                this.selectedIds.push(ticket.id);
            }
        },
        clearSelection() {
            this.selectedIds = [];
        },
        bulkAction(action, value) {
            if (value === '' || value === null || this.selectedIds.length === 0) return;
            axios.post('api/dashboard/tickets/quick-actions', {
                action,
                value,
                tickets: this.selectedIds,
            }).then(() => {
                this.clearSelection();
                this.selectMode = false;
                this.load();
            }).catch(() => this.load());
        },
        bulkDelete() {
            if (this.selectedIds.length === 0) return;
            if (!window.confirm(this.$i18n.t('Are you sure you want to delete the ticket?').toString())) return;
            axios.post('api/dashboard/tickets/quick-actions', {
                action: 'delete',
                tickets: this.selectedIds,
            }).then(() => {
                this.clearSelection();
                this.selectMode = false;
                this.load();
            }).catch(() => this.load());
        },
        openFiltersSidebar() {
            this.filtersSidebar = true;
        },
        closeFiltersSidebar() {
            this.filtersSidebar = false;
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
.dash-kanban-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #f9fafb;
    overflow: hidden;
}

.dash-kanban-header {
    flex-shrink: 0;
}

.dash-kanban-main {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

/* ── Grid ── */
.dash-kanban-grid {
    flex: 1;
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
    overflow: hidden;
    min-height: 0;
}

@media (min-width: 640px) {
    .dash-kanban-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
    .dash-kanban-grid { grid-template-columns: repeat(4, 1fr); }
}

/* ── Mobile: stack columns and scroll the board vertically ── */
@media (max-width: 639px) {
    .dash-kanban-main { overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .dash-kanban-grid { overflow: visible; }
    .dash-kanban-col { min-height: 200px; }
    .col-body { overflow-y: visible; }
}

/* ── Column ── */
.dash-kanban-col {
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
    padding: 0.625rem 1rem;
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
    padding: 0.1rem 0.45rem;
    border-radius: 9999px;
}

.col-body {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 80px;
}

/* ── Cards ── */
.kanban-card {
    position: relative;
    background: #fff;
    border-radius: 0.375rem;
    padding: 0.625rem 0.75rem;
    cursor: pointer;
    user-select: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    transition: box-shadow 0.15s ease, transform 0.1s ease;
}

.kanban-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-1px);
}

/* ── Bulk selection ── */
.kanban-card--pick {
    padding-left: 2.25rem;
}

.kanban-card--selected {
    box-shadow: 0 0 0 2px #2563eb;
}

.bulk-check {
    position: absolute;
    top: 50%;
    left: 0.6rem;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    border: 2px solid #cbd5e0;
    border-radius: 4px;
    background: #fff;
    transition: background 0.12s ease, border-color 0.12s ease;
}

.bulk-check--on {
    background: #2563eb;
    border-color: #2563eb;
}

.bulk-action-bar {
    position: fixed;
    left: 50%;
    bottom: 1.25rem;
    transform: translateX(-50%);
    z-index: 40;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    max-width: calc(100vw - 1.5rem);
    padding: 0.625rem 0.875rem;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    box-shadow: 0 8px 24px -6px rgba(15, 23, 42, 0.18);
}

.bulk-select {
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
    color: #374151;
    background: #fff;
}

.card-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
    margin-bottom: 0.4rem;
}

.card-customer {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
}

.card-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex-shrink: 0;
}

.card-customer-name {
    font-size: 0.7rem;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-subject {
    font-size: 0.8rem;
    font-weight: 500;
    color: #111827;
    line-height: 1.4;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 0.4rem;
}

.card-dept {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.68rem;
    color: #6b7280;
    margin-bottom: 0.4rem;
    min-width: 0;
}

.card-dept-icon {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    color: #9ca3af;
}

.card-labels {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-bottom: 0.4rem;
}

.card-label {
    font-size: 0.6rem;
    font-weight: 600;
    padding: 0.1rem 0.4rem;
    border-radius: 9999px;
    color: #fff;
    white-space: nowrap;
}

.card-footer {
    border-top: 1px solid #f3f4f6;
    padding-top: 0.4rem;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
}

.card-footer-left {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;
}

.priority-badge {
    font-size: 0.6rem;
    font-weight: 600;
    padding: 0.1rem 0.35rem;
    border-radius: 9999px;
}

.agent-avatar {
    width: 18px;
    height: 18px;
    border-radius: 50%;
}

.card-dates {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    text-align: right;
}

.card-date-row {
    display: flex;
    justify-content: flex-end;
    gap: 0.3rem;
    font-size: 0.62rem;
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
