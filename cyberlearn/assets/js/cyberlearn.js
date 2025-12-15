(function () {
    if (typeof window === 'undefined') {
        return;
    }

    const STORAGE_KEY = 'cyberlearn_progress_v1';
    const ACCOUNT_KEY = 'osafe_accounts';
    const PROGRESS_TEMPLATE = () => ({
        lessons: {},
        quizUnlocked: false,
        updatedAt: new Date().toISOString()
    });
    const LESSON_IDS = ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5'];

    function getActiveEmail() {
        const email = localStorage.getItem('osafe_currentUserEmail');
        return email ? email.toLowerCase() : null;
    }

    function loadAllProgress() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.warn('CyberLearn progress reset (parse error).');
            return {};
        }
    }

    function loadState() {
        const key = getActiveEmail();

        if (!key) {
            return PROGRESS_TEMPLATE();
        }

        const all = loadAllProgress();
        const state = all[key];
        return normaliseState(state);
    }

    function normaliseState(state) {
        if (!state || typeof state !== 'object') {
            return PROGRESS_TEMPLATE();
        }
        return {
            lessons: state.lessons && typeof state.lessons === 'object' ? state.lessons : {},
            quizUnlocked: Boolean(state.quizUnlocked),
            updatedAt: state.updatedAt || new Date().toISOString()
        };
    }

    function saveState(nextState) {
        const key = getActiveEmail();

        if (!key) {
            return;
        }

        const all = loadAllProgress();
        all[key] = nextState;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    }

    function clamp(value) {
        const num = Number(value) || 0;
        return Math.max(0, Math.min(100, Math.round(num)));
    }

    function getAccounts() {
        try {
            const raw = localStorage.getItem(ACCOUNT_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            return {};
        }
    }

    function showQuizLockedNotice() {
        let modal = document.getElementById('quiz-locked-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quiz-locked-modal';
            modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-6';

            modal.innerHTML = `
                <div class="relative max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                    <button type="button"
                            class="absolute right-4 top-4 text-2xl text-slate-400 hover:text-slate-600"
                            data-quiz-locked-close
                            aria-label="Close">&times;</button>
                    <h2 class="text-2xl font-semibold text-slate-900 mb-3">Finish the lessons first</h2>
                    <p class="text-sm text-slate-600 mb-4">
                        The final quiz unlocks after you’ve completed all lessons.
                        Please read and complete each lesson to 100% before taking the quiz.
                    </p>
                    <button type="button"
                            data-quiz-locked-close
                            class="mt-2 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white">
                        OK, take me back
                    </button>
                </div>
            `;

            document.body.appendChild(modal);

            const closeButtons = modal.querySelectorAll('[data-quiz-locked-close]');
            closeButtons.forEach((btn) => {
                btn.addEventListener('click', () => {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                });
            });
        } else {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    }

    const CyberLearn = {
        LESSON_IDS,

        getActiveUser() {
            const email = localStorage.getItem('osafe_currentUserEmail');
            const name = localStorage.getItem('osafe_currentUserName');
            if (!email && !name) {
                return null;
            }
            return {
                email: email || '',
                name: name || (email ? email.split('@')[0] : 'Guest')
            };
        },

        formatInitials(name, email) {
            const source = name && name.trim().length ? name : (email || '');
            const parts = source
                .replace(/[^A-Za-z ]+/g, ' ')
                .trim()
                .split(' ')
                .filter(Boolean);

            if (parts.length === 0 && email) {
                return email.slice(0, 2).toUpperCase();
            }

            const chars = parts.slice(0, 2).map((part) => part[0].toUpperCase());
            return chars.join('') || 'CL';
        },

        getProgress() {
            return normaliseState(loadState());
        },

        getLessonsProgress() {
            return this.getProgress().lessons;
        },

        markLessonProgress(lessonId, percent) {
            if (!lessonId) return this.getProgress();

            const state = normaliseState(loadState());
            const current = state.lessons[lessonId] || 0;

            state.lessons[lessonId] = Math.max(current, clamp(percent));
            state.quizUnlocked = LESSON_IDS.every(
                (id) => (state.lessons[id] || 0) >= 100
            );
            state.updatedAt = new Date().toISOString();

            saveState(state);
            return state;
        },

        updateProgress(patch, updater) {
            const state = normaliseState(loadState());
            let draft = JSON.parse(JSON.stringify(state));

            if (typeof updater === 'function') {
                draft = normaliseState(updater(draft) || draft);
            } else if (patch && typeof patch === 'object') {
                draft = normaliseState({ ...draft, ...patch });
            }

            draft.updatedAt = new Date().toISOString();
            saveState(draft);
            return draft;
        },

        logout() {
            localStorage.removeItem('osafe_currentUserEmail');
            localStorage.removeItem('osafe_currentUserName');
        }
    };

    window.CyberLearn = CyberLearn;

    function initNav() {
        const containers = document.querySelectorAll('[data-nav-container]');

        containers.forEach((container) => {
            const authLink = container.querySelector('[data-nav-auth]');
            const userButton = container.querySelector('[data-nav-user]');
            const menu = container.querySelector('[data-nav-menu]');
            const nameEl = container.querySelector('[data-nav-user-name]');
            const emailEl = container.querySelector('[data-nav-user-email]');
            const logoutButton = container.querySelector('[data-nav-logout]');
            const user = CyberLearn.getActiveUser();

            if (user && userButton && menu) {
                if (authLink) authLink.classList.add('hidden');
                userButton.classList.remove('hidden');

                if (nameEl) nameEl.textContent = user.name;
                if (emailEl) emailEl.textContent = user.email || 'Guest access';

                if (!userButton.querySelector('img')) {
                    userButton.textContent = CyberLearn.formatInitials(
                        user.name,
                        user.email
                    );
                }

                userButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    menu.classList.toggle('hidden');
                });

                if (logoutButton) {
                    logoutButton.addEventListener('click', () => {
                        CyberLearn.logout();
                        window.location.href = 'landing.html';
                    });
                }

                menu.addEventListener('click', (event) =>
                    event.stopPropagation()
                );
            } else {
                if (authLink) authLink.classList.remove('hidden');
                if (userButton) userButton.classList.add('hidden');
                if (menu) menu.classList.add('hidden');
            }
        });

        document.addEventListener('click', () => {
            document
                .querySelectorAll('[data-nav-menu]')
                .forEach((menu) => {
                    menu.classList.add('hidden');
                });
        });

        const quizLinks = document.querySelectorAll('[data-nav-quiz]');
        quizLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                const progress = CyberLearn.getProgress();
                if (!progress.quizUnlocked) {
                    event.preventDefault();
                    showQuizLockedNotice();
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNav);
    } else {
        initNav();
    }
})();
