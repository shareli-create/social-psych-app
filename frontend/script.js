document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('attendance-form');
    const nameInput = document.getElementById('name');
    const message = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        if (!name) {
            message.textContent = 'Please enter your name.';
            message.style.color = 'red';
            return;
        }

        const token = window.location.pathname.split('/').pop();

        try {
            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, token }),
            });

            const result = await response.json();

            if (response.ok) {
                message.textContent = result.message;
                message.style.color = 'green';
                form.style.display = 'none';
            } else {
                message.textContent = result.message || 'An error occurred.';
                message.style.color = 'red';
            }
        } catch (error) {
            message.textContent = 'Failed to connect to the server.';
            message.style.color = 'red';
        }
    });
});
