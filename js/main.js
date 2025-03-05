document.addEventListener('DOMContentLoaded', function() {
    // Get the form element
    const form = document.getElementById('contact-form');
    
    // Handle form submission event
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        
        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        
        // You can log the data to the console (for testing purposes)
        console.log('Form Submitted:');
        console.log('Name:', name);
        console.log('Email:', email);
        console.log('Message:', message);
        
        // Display a thank you message
        alert('Thank you for reaching out, ' + name + '! I will get back to you soon.');
        
        // Optionally, clear the form after submission
        form.reset();
    });
});
