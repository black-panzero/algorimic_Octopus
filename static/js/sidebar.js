document.addEventListener('DOMContentLoaded', function() {
    // Get sidebar elements
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.toggle-sidebar');
    const icon = toggleBtn.querySelector('i');

    // Function to update icon and sidebar state
    function updateSidebarState(isCollapsed) {
        if (isCollapsed) {
            // When sidebar is collapsed (minimized), arrow points RIGHT
            icon.classList.remove('fa-chevron-left');
            icon.classList.add('fa-chevron-right');
            sidebar.classList.add('collapsed');
        } else {
            // When sidebar is expanded (maximized), arrow points LEFT
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-left');
            sidebar.classList.remove('collapsed');
        }

        // Store the state in localStorage
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }

    // Handle toggle button click
    toggleBtn.addEventListener('click', function() {
        const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
        updateSidebarState(!isCurrentlyCollapsed);
    });

    // Initialize sidebar state to collapsed by default (arrow pointing right)
    updateSidebarState(true);

    // Handle active menu item
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.nav-item');
    
    menuItems.forEach(item => {
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
    });
});