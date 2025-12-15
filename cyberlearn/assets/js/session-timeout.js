(function () {
    const WARNING_AFTER_MS = 3 * 60 * 1000; 
    const LOGOUT_AFTER_MS = 5 * 60 * 1000;  

    let warningTimer = null;
    let logoutTimer = null;
    let modalBuilt = false;

    function getActiveUser() {
        try {
            if (window.CyberLearn && typeof window.CyberLearn.getActiveUser === 'function') {
                return window.CyberLearn.getActiveUser();
            }
        } catch (e) {
            console.warn('Session timeout: unable to get active user', e);
        }
        return null;
    }

    function buildWarningModal() {
        if (modalBuilt) return;
        modalBuilt = true;

        const wrapper = document.createElement('div');
        wrapper.id = 'session-timeout-modal';
        wrapper.className = 'fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/60 px-6';

        wrapper.innerHTML = `
            <div class="relative max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                <button type="button"
                        data-session-close
                        class="absolute right-4 top-4 text-2xl text-slate-400 hover:text-slate-600"
                        aria-label="Close">&times;</button>
                <h2 class="text-2xl font-semibold text-slate-900 mb-2">Are you still there?</h2>
                <p class="text-slate-600 text-sm mb-4">
                    For your security, you’ll be logged out in <strong>about 3 minutes</strong> if there’s no activity.
                </p>
                <p class="text-slate-600 text-sm mb-6">
                    Move your mouse, tap the screen, or click the button below to stay signed in.
                </p>
                <button type="button"
                        data-session-stay
                        class="mt-2 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white">
                    Stay signed in
                </button>
            </div>
        `;

        document.body.appendChild(wrapper);

        const stayBtn = wrapper.querySelector('[data-session-stay]');
        const closeBtn = wrapper.querySelector('[data-session-close]');

        function staySignedIn() {
            hideWarning();
            resetTimers();
        }

        if (stayBtn) stayBtn.addEventListener('click', staySignedIn);
        if (closeBtn) closeBtn.addEventListener('click', staySignedIn);
    }

    function showWarning() {
        if (!getActiveUser()) return;
        buildWarningModal();
        const modal = document.getElementById('session-timeout-modal');
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function hideWarning() {
        const modal = document.getElementById('session-timeout-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    function doLogout() {
        hideWarning();

        try {
            if (window.CyberLearn && typeof window.CyberLearn.logout === 'function') {
                window.CyberLearn.logout();
            }
        } catch (e) {
            console.warn('Session timeout: error during logout', e);
        }

        alert('You have been logged out after 5 minutes of inactivity. Please sign in again to continue.');
        window.location.href = 'index.html#auth';
    }

    function clearTimers() {
        if (warningTimer) {
            clearTimeout(warningTimer);
            warningTimer = null;
        }
        if (logoutTimer) {
            clearTimeout(logoutTimer);
            logoutTimer = null;
        }
    }

    function resetTimers() {
        if (!getActiveUser()) {
            clearTimers();
            hideWarning();
            return;
        }

        clearTimers();
        hideWarning();

        warningTimer = setTimeout(showWarning, WARNING_AFTER_MS);
        logoutTimer = setTimeout(doLogout, LOGOUT_AFTER_MS);
    }

    function initSessionTimeout() {
        const events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
        events.forEach((eventName) => {
            window.addEventListener(eventName, resetTimers, { passive: true });
        });

        resetTimers();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSessionTimeout);
    } else {
        initSessionTimeout();
    }
})();
