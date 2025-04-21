document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('passengerTableBody');
    const form = document.getElementById('passengerForm');

    // Fetch and display passengers
    async function loadPassengers() {
        try {
            const res = await fetch('/api/passengers');
            const passengers = await res.json();

            tableBody.innerHTML = ''; // Clear previous
            passengers.forEach(addPassengerToTable);
        } catch (err) {
            console.error('Failed to fetch passengers:', err);
        }
    }

    // Add passenger row to table
    function addPassengerToTable(p) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.pass_id}</td>
            <td>${p.pass_name}</td>
            <td>${p.flight_name}</td>
            <td>${p.flight_no}</td>
            <td>${new Date(p.dept_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        `;
        tableBody.appendChild(row);
    }

    // Handle form submit
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassenger = {
            pass_name: document.getElementById('pass_name').value,
            flight_name: document.getElementById('flight_name').value,
            flight_no: document.getElementById('flight_no').value,
            dept_time: document.getElementById('dept_time').value
        };

        try {
            const res = await fetch('/api/passengers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPassenger)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to add');

            addPassengerToTable(data.passenger); // Append new entry
            form.reset();
        } catch (err) {
            console.error('Add passenger error:', err);
            alert('Failed to add passenger');
        }
    });

    // Load passengers on start
    loadPassengers();
});
