document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        console.log('Form Submitted:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Message:', message);

        alert('Thank you for reaching out, ' + name + '! I will get back to you soon.');

        form.reset();
    });

    // Toggle Hamburger Menu
    window.toggleMenu = function() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');
    };

    // Smooth Scrolling Function
    const smoothScroll = function(target) {
        document.querySelector(target).scrollIntoView({
            behavior: 'smooth'
        });
    };

    // Adding smooth scrolling for each link
    const navLinks = document.querySelectorAll('.nav-links li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const target = this.getAttribute('href');
            smoothScroll(target);
            // Close the menu after clicking on mobile
            if (window.innerWidth <= 768) {
                document.querySelector('.nav-links').classList.remove('active');
            }
        });
    });
});
