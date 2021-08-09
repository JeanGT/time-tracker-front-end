import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from './components/Dashboard.vue'
import Receipts from './components/Receipts.vue'
import Timesheets from './components/Timesheets.vue'
import Reports from './components/Reports.vue'
import Auth from './components/Auth.vue'
import Unauthorized from './components/Unauthorized.vue'
import store from './vuex.js'
import { Role } from './utils/role.js'
import axios from "axios"

Vue.use(Router);

async function getUser() {
    let user = store.getters.user;
    if (!user) {
        const response = await axios.get("auth/profile");
        user = response.data;
        store.dispatch("user", user);
    }

    return user;
}

const router = new Router({
    mode: 'history',
    routes: [
        { path: '/dashboard', component: Dashboard, meta: { role: [Role.ADMIN] } },
        { path: '/receipts', component: Receipts, meta: { role: [Role.ADMIN] } },
        { path: '/timesheets', component: Timesheets, meta: { role: [Role.USER, Role.ADMIN] } },
        { path: '/reports', component: Reports, meta: { role: [Role.USER] } },
        { path: '/auth', component: Auth },
        { path: '/unauthorized', component: Unauthorized },

        { path: '*', redirect: '/unauthorized' },
        {
            path: '/', redirect: async function () {
                const user = await getUser();

                if (user.role_id == Role.USER)
                    router.push({ path: '/timesheets' });
                else if (user.role_id == Role.ADMIN)
                    router.push({ path: '/dashboard' });
                else
                    router.push({ path: '/auth' });
            }
        },
    ]
});

router.beforeEach(async (to, from, next) => {
    const { role } = to.meta;
    if (role) {
        try {
            const user = await getUser();

            if (!role.includes(user.role_id)) {
                router.push({ path: '/unauthorized' });
                return;
            }
        } catch {
            router.push({ path: '/auth' });
            return;
        }
    }

    next();
})

export default router;