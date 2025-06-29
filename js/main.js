document.addEventListener('DOMContentLoaded', () => {
    const views = document.querySelectorAll('.view');
    const appContainer = document.getElementById('app-container');
    let activeGameCleanup = null;

    window.showView = function(viewId) {
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

    showView('main-menu-view');
});
