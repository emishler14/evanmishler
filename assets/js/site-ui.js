(function () {
    'use strict';

    function initMenu() {
        var toggle = document.getElementById('menuToggle');
        var nav = document.getElementById('primaryNav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            nav.classList.toggle('is-open');
        });

        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', function (event) {
            if (!nav.contains(event.target) && !toggle.contains(event.target)) {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function initFilter() {
        var buttons = document.querySelectorAll('.filter-btn');
        var cards = document.querySelectorAll('.project-card[data-category]');
        if (!buttons.length || !cards.length) return;

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var filter = button.getAttribute('data-filter');
                buttons.forEach(function (b) { b.classList.remove('active'); });
                button.classList.add('active');

                cards.forEach(function (card) {
                    var category = card.getAttribute('data-category');
                    var show = filter === 'all' || category === filter;
                    card.classList.toggle('project-hidden', !show);
                });
            });
        });
    }

    function initReveal() {
        var items = document.querySelectorAll('.reveal');
        if (!items.length || !('IntersectionObserver' in window)) {
            items.forEach(function (item) { item.classList.add('visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14 });

        items.forEach(function (item) { observer.observe(item); });
    }

    initMenu();
    initFilter();
    initReveal();
})();
