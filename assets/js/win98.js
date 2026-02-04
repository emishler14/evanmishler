/**
 * Windows 98 Desktop Environment
 * Handles window management, dragging, taskbar, boot screen, and interactions
 */

(function() {
    'use strict';

    // State
    let activeWindow = null;
    let zIndexCounter = 100;
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let draggedWindow = null;
    let bootComplete = false;
    let isMobile = window.matchMedia('(max-width: 768px)').matches;
    let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Elements
    const desktop = document.querySelector('.desktop');
    const taskbarWindows = document.getElementById('taskbar-windows');
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const trayTime = document.getElementById('tray-time');
    const bootScreen = document.getElementById('boot-screen');
    const contextMenu = document.getElementById('context-menu');
    const shutdownOverlay = document.getElementById('shutdown-overlay');

    // Initialize
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        setupBootScreen();
        setupDesktopIcons();
        setupWindows();
        setupTaskbar();
        setupStartMenu();
        setupClock();
        setupFilters();
        setupContextMenu();
        setupShutdown();
        setupKeyboardShortcuts();
        setupMobileHandling();
        setupOrientationChange();
    }

    // ==========================================
    // BOOT SCREEN
    // ==========================================

    function setupBootScreen() {
        if (!bootScreen) {
            bootComplete = true;
            openWelcomeWindow();
            return;
        }

        // Wait for boot animation to complete
        setTimeout(() => {
            bootComplete = true;
            bootScreen.classList.add('hidden');
            openWelcomeWindow();
            playStartupSound();
        }, 3500);
    }

    function openWelcomeWindow() {
        const welcomeWindow = document.getElementById('window-welcome');
        if (welcomeWindow) {
            setTimeout(() => {
                showWindow('welcome');
            }, 100);
        }
    }

    function playStartupSound() {
        // Windows 98 startup sound simulation (optional)
        // Uncomment if you want to add audio
        /*
        const audio = new Audio('data:audio/wav;base64,...');
        audio.volume = 0.3;
        audio.play().catch(() => {});
        */
    }

    // ==========================================
    // DESKTOP ICONS
    // ==========================================

    function setupDesktopIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        let clickTimeout = null;
        let clickCount = 0;

        icons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                // On mobile/touch: single tap opens window
                if (isMobile || isTouchDevice) {
                    icon.classList.add('clicking');
                    setTimeout(() => icon.classList.remove('clicking'), 100);

                    const windowId = icon.dataset.window;
                    if (windowId) {
                        showWindow(windowId);
                    }
                    return;
                }

                // On desktop: double-click to open
                clickCount++;
                icon.classList.add('clicking');
                setTimeout(() => icon.classList.remove('clicking'), 100);

                if (clickCount === 1) {
                    // Single click - select icon
                    icons.forEach(i => i.classList.remove('selected'));
                    icon.classList.add('selected');

                    clickTimeout = setTimeout(() => {
                        clickCount = 0;
                    }, 300);
                } else if (clickCount === 2) {
                    // Double click - open window
                    clearTimeout(clickTimeout);
                    clickCount = 0;
                    const windowId = icon.dataset.window;
                    if (windowId) {
                        showWindow(windowId);
                    }
                }
            });
        });

        // Click desktop to deselect icons
        desktop.addEventListener('click', (e) => {
            if (e.target === desktop) {
                icons.forEach(i => i.classList.remove('selected'));
            }
        });
    }

    // ==========================================
    // WINDOW MANAGEMENT
    // ==========================================

    function setupWindows() {
        const windows = document.querySelectorAll('.window');

        windows.forEach(win => {
            // Title bar dragging
            const titleBar = win.querySelector('.title-bar');
            if (titleBar) {
                titleBar.addEventListener('mousedown', (e) => {
                    if (e.target.closest('.title-bar-controls')) return;
                    startDrag(e, win);
                });

                titleBar.addEventListener('touchstart', (e) => {
                    if (e.target.closest('.title-bar-controls')) return;
                    startDrag(e, win);
                }, { passive: false });

                // Double-click title bar to maximize
                titleBar.addEventListener('dblclick', (e) => {
                    if (e.target.closest('.title-bar-controls')) return;
                    toggleMaximize(win);
                });
            }

            // Window controls
            const closeBtn = win.querySelector('.close-btn');
            const minBtn = win.querySelector('.minimize-btn');
            const maxBtn = win.querySelector('.maximize-btn');

            if (closeBtn) {
                closeBtn.addEventListener('click', () => closeWindow(win));
            }

            if (minBtn) {
                minBtn.addEventListener('click', () => minimizeWindow(win));
            }

            if (maxBtn) {
                maxBtn.addEventListener('click', () => toggleMaximize(win));
            }

            // Focus on click
            win.addEventListener('mousedown', () => focusWindow(win));

            // Handle buttons that open other windows
            win.querySelectorAll('[data-window]').forEach(btn => {
                btn.addEventListener('click', () => {
                    showWindow(btn.dataset.window);
                });
            });
        });

        // Global drag events
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);
    }

    function showWindow(windowId) {
        const win = document.getElementById('window-' + windowId);
        if (!win) return;

        // Remove hidden and minimized, add restoring animation
        win.classList.remove('hidden', 'minimized', 'closing', 'minimizing');

        if (win.dataset.wasMinimized) {
            win.classList.add('restoring');
            setTimeout(() => win.classList.remove('restoring'), 200);
            delete win.dataset.wasMinimized;
        }

        focusWindow(win);
        updateTaskbar();

        // Close start menu
        startMenu.classList.add('hidden');
        startButton.classList.remove('active');
    }

    function closeWindow(win) {
        win.classList.add('closing');
        setTimeout(() => {
            win.classList.add('hidden');
            win.classList.remove('closing', 'focused');
            updateTaskbar();
        }, 100);
    }

    function hideWindow(win) {
        win.classList.add('hidden');
        win.classList.remove('focused');
        updateTaskbar();
    }

    // Expose hideWindow globally for inline onclick handlers
    window.hideWindow = hideWindow;

    function minimizeWindow(win) {
        win.dataset.wasMinimized = 'true';
        win.classList.add('minimizing');
        setTimeout(() => {
            win.classList.add('minimized');
            win.classList.remove('minimizing', 'focused');
            updateTaskbar();
        }, 200);
    }

    function toggleMaximize(win) {
        win.classList.toggle('maximized');

        // Store/restore original position
        if (win.classList.contains('maximized')) {
            win.dataset.prevTop = win.style.top;
            win.dataset.prevLeft = win.style.left;
            win.dataset.prevWidth = win.style.width;
        } else {
            win.style.top = win.dataset.prevTop || '80px';
            win.style.left = win.dataset.prevLeft || '150px';
            win.style.width = win.dataset.prevWidth || '500px';
        }
    }

    function focusWindow(win) {
        // Remove focus from all windows
        document.querySelectorAll('.window').forEach(w => {
            w.classList.remove('focused');
        });

        // Focus this window
        win.classList.add('focused');
        zIndexCounter++;
        win.style.zIndex = zIndexCounter;
        activeWindow = win;
        updateTaskbar();
    }

    // ==========================================
    // DRAGGING
    // ==========================================

    function startDrag(e, win) {
        if (win.classList.contains('maximized')) return;

        isDragging = true;
        draggedWindow = win;
        win.classList.add('dragging');

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = win.getBoundingClientRect();
        dragOffset.x = clientX - rect.left;
        dragOffset.y = clientY - rect.top;

        focusWindow(win);
        e.preventDefault();
    }

    function onDrag(e) {
        if (!isDragging || !draggedWindow) return;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let newX = clientX - dragOffset.x;
        let newY = clientY - dragOffset.y;

        // Constrain to desktop
        const desktopRect = desktop.getBoundingClientRect();
        const winRect = draggedWindow.getBoundingClientRect();

        newX = Math.max(-winRect.width + 100, Math.min(newX, desktopRect.width - 50));
        newY = Math.max(0, Math.min(newY, desktopRect.height - 28));

        draggedWindow.style.left = newX + 'px';
        draggedWindow.style.top = newY + 'px';

        e.preventDefault();
    }

    function stopDrag() {
        if (draggedWindow) {
            draggedWindow.classList.remove('dragging');
        }
        isDragging = false;
        draggedWindow = null;
    }

    // ==========================================
    // TASKBAR
    // ==========================================

    function setupTaskbar() {
        updateTaskbar();
    }

    function updateTaskbar() {
        taskbarWindows.innerHTML = '';

        const windows = document.querySelectorAll('.window:not(.hidden)');
        windows.forEach(win => {
            // Skip the properties dialog in taskbar
            if (win.id === 'window-properties') return;

            const titleText = win.querySelector('.title-bar-text');
            const title = titleText ? titleText.textContent.split(' - ')[0] : 'Window';
            const windowId = win.id.replace('window-', '');

            const btn = document.createElement('button');
            btn.className = 'taskbar-window-btn';
            if (win.classList.contains('focused') && !win.classList.contains('minimized')) {
                btn.classList.add('active');
            }

            // Get icon for this window
            const icon = getWindowIcon(windowId);
            btn.innerHTML = `${icon}<span>${title}</span>`;

            btn.addEventListener('click', () => {
                if (win.classList.contains('minimized')) {
                    showWindow(windowId);
                } else if (win.classList.contains('focused')) {
                    minimizeWindow(win);
                } else {
                    focusWindow(win);
                }
            });

            taskbarWindows.appendChild(btn);
        });
    }

    function getWindowIcon(windowId) {
        const icons = {
            'welcome': '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Crect x=\'2\' y=\'3\' width=\'12\' height=\'9\' fill=\'%23c0c0c0\' stroke=\'%23000\'/%3E%3Crect x=\'3\' y=\'4\' width=\'10\' height=\'6\' fill=\'%230000aa\'/%3E%3C/svg%3E" alt="">',
            'about': '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Crect x=\'3\' y=\'2\' width=\'10\' height=\'12\' fill=\'%23ffffcc\' stroke=\'%23000\'/%3E%3Cline x1=\'5\' y1=\'6\' x2=\'11\' y2=\'6\' stroke=\'%23000\'/%3E%3Cline x1=\'5\' y1=\'9\' x2=\'11\' y2=\'9\' stroke=\'%23000\'/%3E%3C/svg%3E" alt="">',
            'portfolio': '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M2 4 L2 13 L14 13 L14 4 L8 4 L7 3 L2 3 Z\' fill=\'%23ffcc00\' stroke=\'%23000\'/%3E%3C/svg%3E" alt="">',
            'contact': '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Crect x=\'2\' y=\'4\' width=\'12\' height=\'8\' fill=\'%23fff\' stroke=\'%23000\'/%3E%3Cpath d=\'M2 4 L8 9 L14 4\' fill=\'none\' stroke=\'%23000\'/%3E%3C/svg%3E" alt="">',
            'projects': '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Crect x=\'4\' y=\'2\' width=\'9\' height=\'11\' fill=\'%23fff\' stroke=\'%23000\'/%3E%3Crect x=\'3\' y=\'3\' width=\'9\' height=\'11\' fill=\'%23fff\' stroke=\'%23000\'/%3E%3Crect x=\'2\' y=\'4\' width=\'9\' height=\'11\' fill=\'%23fff\' stroke=\'%23000\'/%3E%3C/svg%3E" alt="">',
            'minesweeper': '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Ccircle cx=\'8\' cy=\'8\' r=\'5\' fill=\'%23404040\'/%3E%3Ccircle cx=\'8\' cy=\'8\' r=\'3.5\' fill=\'%23000\'/%3E%3Cline x1=\'8\' y1=\'2\' x2=\'8\' y2=\'5\' stroke=\'%23404040\' stroke-width=\'1.5\'/%3E%3Cline x1=\'8\' y1=\'11\' x2=\'8\' y2=\'14\' stroke=\'%23404040\' stroke-width=\'1.5\'/%3E%3Cline x1=\'2\' y1=\'8\' x2=\'5\' y2=\'8\' stroke=\'%23404040\' stroke-width=\'1.5\'/%3E%3Cline x1=\'11\' y1=\'8\' x2=\'14\' y2=\'8\' stroke=\'%23404040\' stroke-width=\'1.5\'/%3E%3C/svg%3E" alt="">',
            'paint': '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Crect x=\'2\' y=\'2\' width=\'12\' height=\'12\' fill=\'%23fff\' stroke=\'%23000\'/%3E%3Crect x=\'2\' y=\'2\' width=\'12\' height=\'2\' fill=\'%230000aa\'/%3E%3Ccircle cx=\'6\' cy=\'9\' r=\'2\' fill=\'%23ff0000\'/%3E%3Ccircle cx=\'10\' cy=\'8\' r=\'2\' fill=\'%2300ff00\'/%3E%3C/svg%3E" alt="">'
        };
        return icons[windowId] || '';
    }

    // ==========================================
    // START MENU
    // ==========================================

    function setupStartMenu() {
        startButton.addEventListener('click', toggleStartMenu);

        // Close start menu when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
                startMenu.classList.add('hidden');
                startButton.classList.remove('active');
            }
        });

        // Start menu items
        startMenu.querySelectorAll('.start-menu-item[data-window]').forEach(item => {
            item.addEventListener('click', () => {
                showWindow(item.dataset.window);
            });
        });
    }

    function toggleStartMenu() {
        startMenu.classList.toggle('hidden');
        startButton.classList.toggle('active');
        contextMenu.classList.add('hidden');
    }

    // ==========================================
    // CONTEXT MENU
    // ==========================================

    function setupContextMenu() {
        if (!contextMenu) return;

        // Right-click on desktop
        desktop.addEventListener('contextmenu', (e) => {
            if (e.target === desktop || e.target.closest('.desktop-icons')) {
                e.preventDefault();
                showContextMenu(e.clientX, e.clientY);
            }
        });

        // Hide on click elsewhere
        document.addEventListener('click', () => {
            contextMenu.classList.add('hidden');
        });

        // Handle context menu actions
        contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                handleContextAction(action);
                contextMenu.classList.add('hidden');
            });
        });
    }

    function showContextMenu(x, y) {
        contextMenu.classList.remove('hidden');

        // Adjust position to stay on screen
        const menuRect = contextMenu.getBoundingClientRect();
        if (x + menuRect.width > window.innerWidth) {
            x = window.innerWidth - menuRect.width - 4;
        }
        if (y + menuRect.height > window.innerHeight - 28) {
            y = window.innerHeight - 28 - menuRect.height - 4;
        }

        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';

        startMenu.classList.add('hidden');
        startButton.classList.remove('active');
    }

    function handleContextAction(action) {
        switch (action) {
            case 'refresh':
                // Subtle refresh animation
                desktop.style.opacity = '0.8';
                setTimeout(() => {
                    desktop.style.opacity = '1';
                }, 100);
                break;
            case 'arrange':
            case 'line-up':
                arrangeIcons();
                break;
            case 'properties':
                showWindow('properties');
                break;
        }
    }

    function arrangeIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        const iconsContainer = document.querySelector('.desktop-icons');
        if (iconsContainer) {
            iconsContainer.style.animation = 'none';
            iconsContainer.offsetHeight; // Trigger reflow
            iconsContainer.style.animation = 'iconArrange 0.3s ease-out';
        }
    }

    // ==========================================
    // SHUTDOWN
    // ==========================================

    function setupShutdown() {
        const shutdownBtn = document.getElementById('shutdown-btn');
        if (shutdownBtn && shutdownOverlay) {
            shutdownBtn.addEventListener('click', () => {
                startMenu.classList.add('hidden');
                startButton.classList.remove('active');
                shutdownOverlay.classList.remove('hidden');
            });
        }
    }

    // ==========================================
    // CLOCK
    // ==========================================

    function setupClock() {
        updateClock();
        setInterval(updateClock, 1000);
    }

    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;

        trayTime.textContent = `${hours}:${minutes} ${ampm}`;
    }

    // ==========================================
    // PORTFOLIO FILTERS
    // ==========================================

    function setupFilters() {
        const tabs = document.querySelectorAll('menu[role="tablist"] li[data-filter]');
        const items = document.querySelectorAll('.portfolio-item');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
                tab.setAttribute('aria-selected', 'true');

                const filter = tab.dataset.filter;

                // Filter items with animation
                items.forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.classList.remove('hidden');
                        item.style.animation = 'fadeIn 0.2s ease-out';
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    // ==========================================
    // KEYBOARD SHORTCUTS
    // ==========================================

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape to close active window or menus
            if (e.key === 'Escape') {
                if (!startMenu.classList.contains('hidden')) {
                    startMenu.classList.add('hidden');
                    startButton.classList.remove('active');
                } else if (!contextMenu.classList.contains('hidden')) {
                    contextMenu.classList.add('hidden');
                } else if (activeWindow && !activeWindow.classList.contains('hidden')) {
                    closeWindow(activeWindow);
                }
            }

            // Windows key or Ctrl+Escape to toggle start menu
            if (e.key === 'Meta' || (e.ctrlKey && e.key === 'Escape')) {
                e.preventDefault();
                toggleStartMenu();
            }

            // Alt+F4 to close window
            if (e.altKey && e.key === 'F4') {
                e.preventDefault();
                if (activeWindow && !activeWindow.classList.contains('hidden')) {
                    closeWindow(activeWindow);
                }
            }

            // Tab to cycle through windows
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                cycleWindows();
            }
        });
    }

    function cycleWindows() {
        const openWindows = Array.from(document.querySelectorAll('.window:not(.hidden):not(.minimized)'));
        if (openWindows.length < 2) return;

        const currentIndex = openWindows.indexOf(activeWindow);
        const nextIndex = (currentIndex + 1) % openWindows.length;
        focusWindow(openWindows[nextIndex]);
    }

    // ==========================================
    // MOBILE HANDLING
    // ==========================================

    function setupMobileHandling() {
        // Update mobile flag on resize
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        mediaQuery.addEventListener('change', (e) => {
            isMobile = e.matches;
            handleMobileChange();
        });

        // Prevent pull-to-refresh on mobile
        document.body.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.preventDefault();
            }
        }, { passive: false });

        // Handle iOS safe areas
        if (CSS.supports('padding-top: env(safe-area-inset-top)')) {
            document.documentElement.style.setProperty('--safe-top', 'env(safe-area-inset-top)');
            document.documentElement.style.setProperty('--safe-bottom', 'env(safe-area-inset-bottom)');
        }

        // Add mobile class to body
        if (isMobile) {
            document.body.classList.add('is-mobile');
        }

        // Swipe down to minimize window on mobile
        if (isTouchDevice) {
            setupSwipeGestures();
        }

        // Setup quick access bar
        setupQuickAccessBar();

        // Show mobile hint on first visit
        showMobileHint();
    }

    function setupQuickAccessBar() {
        const quickAccessBar = document.getElementById('quick-access-bar');
        if (!quickAccessBar) return;

        quickAccessBar.querySelectorAll('.quick-access-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const windowId = btn.dataset.window;
                if (windowId) {
                    showWindow(windowId);
                }
            });
        });
    }

    function showMobileHint() {
        if (!isMobile && !isTouchDevice) return;

        const mobileHint = document.getElementById('mobile-hint');
        if (!mobileHint) return;

        // Check if user has seen the hint before
        const hasSeenHint = localStorage.getItem('win98-hint-seen');
        if (hasSeenHint) return;

        // Show hint after boot screen
        setTimeout(() => {
            if (bootComplete) {
                mobileHint.classList.remove('hidden');
            }
        }, 4000);
    }

    // Global function for dismissing mobile hint
    window.dismissMobileHint = function() {
        const mobileHint = document.getElementById('mobile-hint');
        if (mobileHint) {
            mobileHint.classList.add('hidden');
            localStorage.setItem('win98-hint-seen', 'true');
        }
    };

    function handleMobileChange() {
        if (isMobile) {
            document.body.classList.add('is-mobile');
            // Close all windows except one on mobile switch
            const openWindows = document.querySelectorAll('.window:not(.hidden)');
            if (openWindows.length > 1) {
                openWindows.forEach((win, index) => {
                    if (index > 0) {
                        win.classList.add('hidden');
                    }
                });
            }
        } else {
            document.body.classList.remove('is-mobile');
        }
        updateTaskbar();
    }

    function setupSwipeGestures() {
        let touchStartY = 0;
        let touchStartX = 0;
        let currentWindow = null;

        document.addEventListener('touchstart', (e) => {
            const titleBar = e.target.closest('.title-bar');
            if (titleBar && !e.target.closest('.title-bar-controls')) {
                touchStartY = e.touches[0].clientY;
                touchStartX = e.touches[0].clientX;
                currentWindow = titleBar.closest('.window');
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (!currentWindow || isDragging) {
                currentWindow = null;
                return;
            }

            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const deltaY = touchEndY - touchStartY;
            const deltaX = Math.abs(touchEndX - touchStartX);

            // Swipe down to minimize (if vertical swipe is greater than horizontal)
            if (deltaY > 80 && deltaY > deltaX) {
                minimizeWindow(currentWindow);
            }

            currentWindow = null;
        }, { passive: true });
    }

    // ==========================================
    // ORIENTATION CHANGE
    // ==========================================

    function setupOrientationChange() {
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            // Small delay to let the browser settle
            setTimeout(() => {
                // Reposition windows after orientation change
                repositionWindows();
                updateTaskbar();
            }, 100);
        });

        // Also handle resize for desktop browser resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                isMobile = window.matchMedia('(max-width: 768px)').matches;
                if (isMobile) {
                    repositionWindows();
                }
            }, 150);
        });
    }

    function repositionWindows() {
        const windows = document.querySelectorAll('.window:not(.hidden)');
        const desktopRect = desktop.getBoundingClientRect();

        windows.forEach(win => {
            if (win.classList.contains('maximized')) return;

            const rect = win.getBoundingClientRect();

            // Keep windows within viewport
            if (rect.right > desktopRect.width) {
                win.style.left = Math.max(0, desktopRect.width - rect.width - 8) + 'px';
            }
            if (rect.bottom > desktopRect.height) {
                win.style.top = Math.max(0, desktopRect.height - rect.height - 8) + 'px';
            }
        });
    }

    // ==========================================
    // UTILITY: Add CSS animation
    // ==========================================

    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes iconArrange {
            0% { transform: scale(0.98); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }

        /* iOS safe area support */
        .taskbar {
            padding-bottom: var(--safe-bottom, 0);
        }

        .is-mobile .start-menu {
            bottom: calc(36px + var(--safe-bottom, 0));
        }

        /* Smooth window transitions on mobile */
        .is-mobile .window {
            transition: transform 0.2s ease-out;
        }

        .is-mobile .window.dragging {
            transition: none;
        }
    `;
    document.head.appendChild(style);

})();
