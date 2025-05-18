document.addEventListener('DOMContentLoaded', function () {
    // Contact form submission
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form from submitting the default way

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        console.log('Form Submitted:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Message:', message);

        alert('Thank you for reaching out, ' + name + '! I will get back to you soon.');

        form.reset(); // Reset the form fields after submission
    });

    // Toggle Hamburger Menu
    window.toggleMenu = function () {
        const navLinks = document.querySelector('.nav-links');
        const hamburger = document.getElementById('hamburger');

        navLinks.classList.toggle('active'); // Show/hide menu

        // Toggle icon
        if (navLinks.classList.contains('active')) {
            hamburger.innerHTML = '&#10005;'; // ✖
        } else {
            hamburger.innerHTML = '&#9776;'; // ☰
        }
    };

    // Smooth Scrolling Function
    const smoothScroll = function (target) {
        document.querySelector(target).scrollIntoView({
            behavior: 'smooth'
        });
    };

    // Adding smooth scrolling for each link
    const navLinks = document.querySelectorAll('.nav-links li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent the default anchor click action
            const target = this.getAttribute('href'); // Get the href of the clicked link
            smoothScroll(target); // Perform smooth scrolling to the target

            // Close the menu after clicking on mobile
            if (window.innerWidth <= 768) {
                const navLinksElement = document.querySelector('.nav-links');
                navLinksElement.classList.remove('active'); // Hide menu
                document.getElementById('hamburger').innerHTML = '&#9776;'; // Reset to ☰
            }
        });
    });
});
