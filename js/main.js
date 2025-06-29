document.addEventListener('DOMContentLoaded', () => {
    const views = document.querySelectorAll('.view');
    const appContainer = document.getElementById('app-container');
    let activeGameCleanup = null;

    // تابع اصلی برای نمایش یک صفحه (view) خاص
    window.showView = function(viewId) {
        // اگر بازی فعالی در حال اجراست، آن را پاکسازی کن
        if (typeof activeGameCleanup === 'function') {
            activeGameCleanup();
            activeGameCleanup = null;
        }

        views.forEach(view => {
            if (view.id === viewId) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        });
    }

    // Event delegation for navigation buttons
    appContainer.addEventListener('click', (event) => {
        const button = event.target.closest('.nav-btn, .back-btn');
        if (!button) return;

        const targetViewId = button.getAttribute('data-target');
        if (targetViewId) {
            showView(targetViewId);

            const initFunction = button.getAttribute('data-init');
            if (initFunction && typeof window[initFunction] === 'function') {
                activeGameCleanup = window[initFunction](); 
            }
        }
    });

    // نمایش منوی اصلی در اولین ورود
    showView('main-menu-view');
});
