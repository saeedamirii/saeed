document.addEventListener('DOMContentLoaded', () => {
    const views = document.querySelectorAll('.view');
    const navButtons = document.querySelectorAll('.nav-btn, .back-btn');
    let activeGameCleanup = null; // تابعی برای پاکسازی بازی فعال (متوقف کردن تایمرها)

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

    // به تمام دکمه‌های راهبری، قابلیت کلیک می‌دهیم
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetViewId = button.getAttribute('data-target');
            if (targetViewId) {
                showView(targetViewId);

                // اگر دکمه مربوط به شروع یک بازی است، آن را مقداردهی اولیه کن
                const initFunction = button.getAttribute('data-init');
                if (initFunction && typeof window[initFunction] === 'function') {
                    // تابع پاکسازی بازی قبلی را برمی‌گردانیم تا بعدا استفاده شود
                    activeGameCleanup = window[initFunction](); 
                }
            }
        });
    });

    // نمایش منوی اصلی در اولین ورود
    showView('main-menu-view');
});

